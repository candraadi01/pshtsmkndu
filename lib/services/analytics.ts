"use server";

import { revalidatePath } from "next/cache";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoredArticles, incrementStoredArticleView, resetStoredArticleViews } from "./article-store";
import { getStoredAnnouncements } from "./announcement-store";
import {
  getMetricsResetTimestamp,
  setMetricsResetTimestamp,
  readLocalVisits,
  clearLocalVisits,
} from "./metrics-store";

export interface DashboardMetrics {
  totalVisits: number;
  todayVisits: number;
  totalArticleViews: number;
  totalArticles: number;
  totalPengumuman: number;
  totalDokumen: number;
  totalPelatih: number;
  totalWarga: number;
  totalSiswa: number;
  topArticles: Array<{
    id: number;
    judul: string;
    slug: string;
    view_count: number;
    kategori: string;
  }>;
  recentVisits: Array<{
    id: number;
    path: string;
    user_agent: string | null;
    created_at: string;
  }>;
}

/**
 * Increments article view count when an article is read.
 */
export async function incrementArticleViews(slug: string) {
  try {
    // 1. Update resilient article store
    await incrementStoredArticleView(slug);

    // 2. Also try updating Supabase directly
    const client = createOptionalSupabaseClient();
    if (client) {
      const { data: article } = await client
        .from("artikel")
        .select("id, view_count")
        .eq("slug", slug)
        .maybeSingle();

      if (article) {
        await client
          .from("artikel")
          .update({ view_count: (Number(article.view_count) || 0) + 1 })
          .eq("id", article.id);
      }
    }
  } catch {
    // Fail silently
  }
}

/**
 * Fetches aggregated metrics for the Admin Dashboard.
 */
export async function getDashboardAnalytics(): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServerClient();
  const resetAt = await getMetricsResetTimestamp();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // If reset was done today or later, filter from resetAt
  const effectiveTodayStart = resetAt && new Date(resetAt) > todayStart
    ? resetAt
    : todayStart.toISOString();

  let totalVisitsQuery = supabase.from("site_visits").select("*", { count: "exact", head: true });
  if (resetAt) {
    totalVisitsQuery = totalVisitsQuery.gte("created_at", resetAt);
  }

  let todayVisitsQuery = supabase
    .from("site_visits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", effectiveTodayStart);

  let recentVisitsQuery = supabase
    .from("site_visits")
    .select("id, path, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (resetAt) {
    recentVisitsQuery = recentVisitsQuery.gte("created_at", resetAt);
  }

  // Parallel queries to Supabase & local stores
  const [
    totalVisitsRes,
    todayVisitsRes,
    dokumenRes,
    peopleRes,
    recentVisitsRes,
    allArticles,
    allAnnouncements,
    localVisits,
  ] = await Promise.all([
    totalVisitsQuery,
    todayVisitsQuery,
    supabase.from("dokumen").select("*", { count: "exact", head: true }),
    supabase.from("people").select("id, tipe"),
    recentVisitsQuery,
    getStoredArticles(),
    getStoredAnnouncements(),
    readLocalVisits(),
  ]);

  // Combine counts with local resilient store fallback
  const validLocal = localVisits.filter((v) => !resetAt || v.created_at >= resetAt);
  const todayLocal = validLocal.filter((v) => v.created_at >= effectiveTodayStart);

  const totalVisits = Math.max(totalVisitsRes.count ?? 0, validLocal.length);
  const todayVisits = Math.max(todayVisitsRes.count ?? 0, todayLocal.length);

  const totalArticleViews = allArticles.reduce((sum, a) => sum + (Number(a.view_count) || 0), 0);
  const topArticles = allArticles.slice(0, 5).map((a) => ({
    id: a.id,
    judul: a.judul,
    slug: a.slug,
    view_count: Number(a.view_count) || 0,
    kategori: a.kategori || "Umum",
  }));

  const people = peopleRes.data || [];
  const totalPelatih = people.filter((p) => p.tipe === "pelatih").length;
  const totalWarga = people.filter((p) => p.tipe === "warga").length;
  const totalSiswa = people.filter((p) => p.tipe === "siswa").length;

  return {
    totalVisits,
    todayVisits,
    totalArticleViews,
    totalArticles: allArticles.length,
    totalPengumuman: allAnnouncements.length,
    totalDokumen: dokumenRes.count ?? 0,
    totalPelatih,
    totalWarga,
    totalSiswa,
    topArticles,
    recentVisits: (recentVisitsRes.data as DashboardMetrics["recentVisits"]) || [],
  };
}

/**
 * Action to reset all article view counts and site visits to 0
 */
export async function resetAllMetricsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();

    // 1. Record reset timestamp so all older visits are excluded immediately
    await setMetricsResetTimestamp(nowIso);

    // 2. Clear local visits store
    await clearLocalVisits();

    // 3. Reset stored article views
    await resetStoredArticleViews();

    // 4. Attempt to clear Supabase site_visits and reset artikel view_count
    try {
      const supabase = await createSupabaseServerClient();
      const [delVisits, updateArt] = await Promise.all([
        supabase.from("site_visits").delete().neq("id", 0),
        supabase.from("artikel").update({ view_count: 0 }).neq("id", 0),
      ]);
      if (delVisits.error) {
        console.warn("Supabase site_visits delete warning:", delVisits.error.message);
      }
      if (updateArt.error) {
        console.warn("Supabase artikel reset warning:", updateArt.error.message);
      }
    } catch (dbErr) {
      console.warn("Supabase reset metrics warning:", dbErr);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    revalidatePath("/admin/artikel");
    revalidatePath("/artikel");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mereset metrik";
    return { success: false, error: errorMsg };
  }
}

