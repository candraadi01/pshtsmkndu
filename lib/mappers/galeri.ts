import { formatIndonesianDate } from "@/lib/date";
import type { Gallery, GalleryImage } from "@/types/content";

export interface SupabaseImageRow {
  id: number;
  gallery_id: number;
  path: string;
  caption?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SupabaseGalleryRow {
  id: number;
  nama_galeri: string;
  deskripsi?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  images?: SupabaseImageRow[] | null;
}

export function mapGalleryImage(row: SupabaseImageRow): GalleryImage {
  return {
    id: row.id,
    gallery_id: row.gallery_id,
    path: row.path,
    caption: row.caption ?? null,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  };
}

export function mapGallery(row: SupabaseGalleryRow): Gallery {
  const images: GalleryImage[] = Array.isArray(row.images)
    ? row.images
        .map(mapGalleryImage)
        .sort((a, b) => a.id - b.id)
    : [];

  return {
    id: row.id,
    nama_galeri: row.nama_galeri,
    deskripsi: row.deskripsi ?? null,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
    created_at_formatted: formatIndonesianDate(row.created_at),
    images,
  };
}
