import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoredArticles } from "@/lib/services/article-store";
import { getStoredAnnouncements } from "@/lib/services/announcement-store";
import { getMetricsResetTimestamp, readLocalVisits } from "@/lib/services/metrics-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify admin auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isSuperAdmin = profile.role === "super_admin";
    const resetAt = await getMetricsResetTimestamp();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

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

    // Parallel fetch all data fresh from DB & local store
    const [
      totalVisitsRes,
      todayVisitsRes,
      dokumenRes,
      peopleRes,
      recentVisitsRes,
      allArticles,
      allAnnouncements,
      localVisits,
      recentLogsRes,
      recentStudentsRes,
    ] = await Promise.all([
      totalVisitsQuery,
      todayVisitsQuery,
      supabase.from("dokumen").select("*", { count: "exact", head: true }),
      supabase.from("people").select("id, tipe"),
      recentVisitsQuery,
      getStoredArticles(),
      getStoredAnnouncements(),
      readLocalVisits(),
      // Activity logs for super admin
      isSuperAdmin
        ? supabase
            .from("admin_activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [], error: null }),
      // Recent students for admin
      !isSuperAdmin
        ? supabase
            .from("people")
            .select("id, nama, jenis_kelamin, alamat, no_hp, created_at")
            .eq("tipe", "siswa")
            .order("created_at", { ascending: false })
            .limit(6)
        : Promise.resolve({ data: [], error: null }),
    ]);

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

    const result = {
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
      recentVisits: recentVisitsRes.data || [],
      recentLogs: recentLogsRes.data || [],
      recentStudents: recentStudentsRes.data || [],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
      },
    });
  } catch (err) {
    console.error("Admin analytics API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
