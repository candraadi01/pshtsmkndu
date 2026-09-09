import type { Artikel, ArtikelStatus } from "@/types/content";

export interface SupabaseArtikelRow {
  id: number;
  judul: string;
  slug: string;
  gambar?: string | null;
  isi?: string | null;
  excerpt?: string | null;
  legacy_user_id?: number | null;
  author_id?: string | null;
  kategori?: string | null;
  status?: string | null;
  published_at?: string | null;
  view_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function mapArtikel(row: SupabaseArtikelRow): Artikel {
  return {
    id: row.id,
    judul: row.judul,
    slug: row.slug,
    gambar: row.gambar ?? null,
    isi: row.isi ?? "",
    excerpt: row.excerpt ?? null,
    legacy_user_id: row.legacy_user_id ?? null,
    author_id: row.author_id ?? null,
    id_user: row.legacy_user_id ?? null,
    kategori: row.kategori ?? "Umum",
    status: (row.status as ArtikelStatus) ?? "published",
    published_at: row.published_at ?? null,
    view_count: row.view_count ?? 0,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  };
}
