import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { fallbackHomeData } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";

export interface ArticleRecord {
  id: number;
  judul: string;
  slug: string;
  isi: string;
  excerpt?: string | null;
  kategori?: string;
  status: string;
  gambar?: string | null;
  view_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author_id?: string | null;
  legacy_user_id?: number | null;
}

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "articles.json");

/**
 * Helper to ensure storage directory exists
 */
async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Read local JSON file safely
 */
async function readLocalArticles(): Promise<ArticleRecord[] | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ArticleRecord[];
    return null;
  } catch {
    return null;
  }
}

/**
 * Write local JSON file safely
 */
async function writeLocalArticles(articles: ArticleRecord[]): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(articles, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local articles storage:", err);
  }
}

/**
 * Get all articles with dual-layer fallback & sync
 */
export async function getStoredArticles(): Promise<ArticleRecord[]> {
  // 1. Try reading from Supabase first
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      const { data: dbData, error } = await client
        .from("artikel")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && dbData && dbData.length > 0) {
        const records = dbData.map((d) => ({
          ...d,
          view_count: Number(d.view_count) || 0,
        })) as ArticleRecord[];
        // Sync local cache
        await writeLocalArticles(records);
        return records;
      }
    } catch {
      // Fall through to local storage
    }
  }

  // 2. Try reading from local storage
  const local = await readLocalArticles();
  if (local !== null) {
    return local;
  }

  // 3. First-time initialization: seed with default demo articles (view_count = 0)
  const initial: ArticleRecord[] = fallbackHomeData.popularArticles.map((a, idx) => ({
    id: a.id || idx + 1,
    judul: a.judul,
    slug: a.slug,
    isi: a.isi,
    excerpt: a.excerpt || "",
    kategori: a.kategori || "Umum",
    status: a.status || "published",
    gambar: a.gambar || null,
    view_count: 0,
    published_at: a.published_at || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_id: null,
    legacy_user_id: 1,
  }));

  await writeLocalArticles(initial);

  // Attempt to seed to Supabase if empty
  if (client) {
    try {
      await client.from("artikel").insert(initial);
    } catch {
      // Ignore RLS errors during bootstrap
    }
  }

  return initial;
}

/**
 * Save (Insert or Update) an article in Supabase and Local Storage
 */
export async function saveStoredArticle(articleData: Partial<ArticleRecord> & { judul: string; isi: string }): Promise<{ success: boolean; article?: ArticleRecord; error?: string }> {
  const all = await getStoredArticles();
  const now = new Date().toISOString();
  let savedArticle: ArticleRecord;

  if (articleData.id) {
    // UPDATE existing
    const existingIndex = all.findIndex((a) => a.id === Number(articleData.id));
    const existing = existingIndex !== -1 ? all[existingIndex] : null;

    savedArticle = {
      ...(existing || {}),
      ...articleData,
      id: Number(articleData.id),
      judul: articleData.judul.trim(),
      isi: articleData.isi.trim(),
      slug: articleData.slug || existing?.slug || `${Date.now()}`,
      excerpt: articleData.isi.replace(/<[^>]*>/g, "").slice(0, 160) + "...",
      kategori: articleData.kategori || existing?.kategori || "Umum",
      status: articleData.status || existing?.status || "published",
      gambar: articleData.gambar !== undefined ? articleData.gambar : existing?.gambar,
      view_count: existing?.view_count || 0,
      updated_at: now,
      created_at: existing?.created_at || now,
    };

    if (existingIndex !== -1) {
      all[existingIndex] = savedArticle;
    } else {
      all.unshift(savedArticle);
    }

    // Update in Supabase
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("artikel").update(savedArticle).eq("id", savedArticle.id);
    } catch (err) {
      console.warn("Supabase update artikel error:", err);
    }
  } else {
    // INSERT new
    const maxId = all.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0);
    const newId = maxId + 1;

    savedArticle = {
      ...articleData,
      id: newId,
      judul: articleData.judul.trim(),
      isi: articleData.isi.trim(),
      slug: articleData.slug || `${Date.now()}`,
      excerpt: articleData.isi.replace(/<[^>]*>/g, "").slice(0, 160) + "...",
      kategori: articleData.kategori || "Umum",
      status: articleData.status || "published",
      gambar: articleData.gambar || null,
      view_count: 0,
      created_at: now,
      updated_at: now,
      published_at: articleData.status === "published" ? now : null,
    };

    all.unshift(savedArticle);

    // Insert in Supabase
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("artikel").insert(savedArticle);
    } catch (err) {
      console.warn("Supabase insert artikel error:", err);
    }
  }

  // Save to persistent local storage
  await writeLocalArticles(all);

  // Revalidate caches
  revalidatePath("/", "layout");
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  revalidatePath("/admin");

  return { success: true, article: savedArticle };
}

/**
 * Delete an article permanently
 */
export async function deleteStoredArticle(id: number): Promise<{ success: boolean; error?: string }> {
  const all = await getStoredArticles();
  const filtered = all.filter((a) => a.id !== id);

  // 1. Delete from Supabase
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("artikel").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete artikel error:", err);
  }

  // 2. Save filtered list to local storage
  await writeLocalArticles(filtered);

  // Revalidate caches
  revalidatePath("/", "layout");
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Increment view count for an article
 */
export async function incrementStoredArticleView(slug: string): Promise<void> {
  const all = await getStoredArticles();
  const article = all.find((a) => a.slug === slug);
  if (!article) return;

  article.view_count = (article.view_count || 0) + 1;
  await writeLocalArticles(all);

  try {
    const client = createOptionalSupabaseClient();
    if (client) {
      await client
        .from("artikel")
        .update({ view_count: article.view_count })
        .eq("slug", slug);
    }
  } catch {
    // Ignore error
  }
}

/**
 * Reset all article views to 0
 */
export async function resetStoredArticleViews(): Promise<void> {
  const all = await getStoredArticles();
  all.forEach((a) => {
    a.view_count = 0;
  });
  await writeLocalArticles(all);

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("artikel").update({ view_count: 0 }).neq("id", 0);
  } catch {
    // Ignore error
  }

  revalidatePath("/", "layout");
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  revalidatePath("/admin");
}
