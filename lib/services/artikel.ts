import { mapArtikel, type SupabaseArtikelRow } from "@/lib/mappers/artikel";
import { getStoredArticles } from "./article-store";
import type { Artikel } from "@/types/content";

export interface GetArticlesOptions {
  limit?: number;
  search?: string;
}

export async function getArticles(options?: GetArticlesOptions | number): Promise<Artikel[]> {
  const limit = typeof options === "number" ? options : options?.limit;
  const rawSearch = typeof options === "object" ? options?.search : undefined;
  const search = typeof rawSearch === "string" ? rawSearch.trim().toLowerCase() : "";

  const stored = await getStoredArticles();
  let articles = stored
    .filter((a) => a.status === "published")
    .map((r) => mapArtikel(r as unknown as SupabaseArtikelRow));

  if (search) {
    articles = articles.filter(
      (a) =>
        a.judul.toLowerCase().includes(search) ||
        a.excerpt?.toLowerCase().includes(search) ||
        a.isi.toLowerCase().includes(search)
    );
  }

  if (typeof limit === "number" && limit > 0) {
    articles = articles.slice(0, limit);
  }

  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Artikel | null> {
  const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  if (!normalizedSlug) return null;

  const stored = await getStoredArticles();
  const found = stored.find((a) => a.slug.toLowerCase() === normalizedSlug);
  if (!found) return null;

  return mapArtikel(found as unknown as SupabaseArtikelRow);
}
