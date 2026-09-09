import { fallbackGalleries } from "@/lib/demo-data";
import {
  mapGallery,
  type SupabaseGalleryRow,
  type SupabaseImageRow,
} from "@/lib/mappers/galeri";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import type { Gallery } from "@/types/content";

export async function getGalleries(): Promise<Gallery[]> {
  const client = createOptionalSupabaseClient();
  if (!client) {
    return fallbackGalleries;
  }

  try {
    // 1. Coba query dengan join nested images(*)
    const { data, error } = await client
      .from("galleries")
      .select("id, nama_galeri, deskripsi, created_at, updated_at, images(*)")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as SupabaseGalleryRow[]).map(mapGallery);
    }

    // 2. Jika query join gagal/kosong, coba query terpisah (galleries & images)
    const [galleriesRes, imagesRes] = await Promise.all([
      client
        .from("galleries")
        .select("id, nama_galeri, deskripsi, created_at, updated_at")
        .order("created_at", { ascending: false }),
      client
        .from("images")
        .select("id, gallery_id, path, caption, created_at, updated_at")
        .order("id", { ascending: true }),
    ]);

    if (galleriesRes.error || !galleriesRes.data || galleriesRes.data.length === 0) {
      return fallbackGalleries;
    }

    const allImages = (imagesRes.data as SupabaseImageRow[] | null) ?? [];

    const assembled: SupabaseGalleryRow[] = galleriesRes.data.map((gal) => ({
      ...gal,
      images: allImages.filter((img) => img.gallery_id === gal.id),
    }));

    return assembled.map(mapGallery);
  } catch (error) {
    console.warn("Supabase Galeri service memakai fallback:", error);
    return fallbackGalleries;
  }
}
