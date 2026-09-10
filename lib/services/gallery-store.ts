import fs from "fs/promises";
import path from "path";
import { safeRevalidatePath } from "@/lib/services/cache-helper";
import { fallbackGalleries } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapGallery, type SupabaseGalleryRow, type SupabaseImageRow } from "@/lib/mappers/galeri";
import type { Gallery, GalleryImage } from "@/types/content";

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "galleries.json");

async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readLocalGalleries(): Promise<Gallery[] | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Gallery[];
    return null;
  } catch {
    return null;
  }
}

async function writeLocalGalleries(galleries: Gallery[]): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(galleries, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local galleries storage:", err);
  }
}

/**
 * Get all galleries with resilient dual-layer sync
 */
export async function getStoredGalleries(): Promise<Gallery[]> {
  // 1. Try reading from Supabase first
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      const { data: dbData, error } = await client
        .from("galleries")
        .select("id, nama_galeri, deskripsi, created_at, updated_at, images(*)")
        .order("created_at", { ascending: false });

      if (!error && dbData && dbData.length > 0) {
        const mapped = (dbData as SupabaseGalleryRow[]).map(mapGallery);
        await writeLocalGalleries(mapped);
        return mapped;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Read from persistent local JSON
  const local = await readLocalGalleries();
  if (local !== null && local.length > 0) {
    return local;
  }

  // 3. Initialize from fallbackGalleries
  const initial = JSON.parse(JSON.stringify(fallbackGalleries)) as Gallery[];
  await writeLocalGalleries(initial);

  // Attempt to sync bootstrap to Supabase if possible
  if (client) {
    try {
      for (const gal of initial) {
        await client.from("galleries").upsert({
          id: gal.id,
          nama_galeri: gal.nama_galeri,
          deskripsi: gal.deskripsi,
          created_at: gal.created_at || new Date().toISOString(),
        });
        if (gal.images && gal.images.length > 0) {
          for (const img of gal.images) {
            await client.from("images").upsert({
              id: img.id,
              gallery_id: gal.id,
              path: img.path,
              caption: img.caption,
            });
          }
        }
      }
    } catch {
      // Ignore initial seed sync warnings
    }
  }

  return initial;
}

/**
 * Save (Insert or Update) a Gallery Album
 */
export async function saveStoredGallery(data: {
  id?: number | null;
  nama_galeri: string;
  deskripsi?: string | null;
}): Promise<{ success: boolean; gallery: Gallery }> {
  const all = await getStoredGalleries();
  const now = new Date().toISOString();
  let saved: Gallery;

  if (data.id) {
    const existingIndex = all.findIndex((g) => g.id === Number(data.id));
    const existing = existingIndex !== -1 ? all[existingIndex] : null;

    saved = {
      id: Number(data.id),
      nama_galeri: data.nama_galeri.trim(),
      deskripsi: data.deskripsi?.trim() || null,
      created_at: existing?.created_at || now,
      updated_at: now,
      created_at_formatted: existing?.created_at_formatted,
      images: existing?.images || [],
    };

    if (existingIndex !== -1) {
      all[existingIndex] = saved;
    } else {
      all.unshift(saved);
    }

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("galleries").update({
        nama_galeri: saved.nama_galeri,
        deskripsi: saved.deskripsi,
        updated_at: now,
      }).eq("id", saved.id);
    } catch (err) {
      console.warn("Supabase update gallery warning:", err);
    }
  } else {
    const maxId = all.reduce((max, g) => Math.max(max, Number(g.id) || 0), 0);
    const newId = maxId + 1;

    saved = {
      id: newId,
      nama_galeri: data.nama_galeri.trim(),
      deskripsi: data.deskripsi?.trim() || null,
      created_at: now,
      updated_at: now,
      images: [],
    };

    all.unshift(saved);

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("galleries").insert({
        id: newId,
        nama_galeri: saved.nama_galeri,
        deskripsi: saved.deskripsi,
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.warn("Supabase insert gallery warning:", err);
    }
  }

  await writeLocalGalleries(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/galeri");
  safeRevalidatePath("/admin/galeri");
  safeRevalidatePath("/admin");

  return { success: true, gallery: saved };
}

/**
 * Delete a Gallery Album and all its photos
 */
export async function deleteStoredGallery(id: number): Promise<{ success: boolean }> {
  const all = await getStoredGalleries();
  const filtered = all.filter((g) => g.id !== id);

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("images").delete().eq("gallery_id", id);
    await supabase.from("galleries").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete gallery warning:", err);
  }

  await writeLocalGalleries(filtered);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/galeri");
  safeRevalidatePath("/admin/galeri");
  safeRevalidatePath("/admin");

  return { success: true };
}

/**
 * Add a photo to an existing Gallery Album
 */
export async function addStoredGalleryPhoto(data: {
  gallery_id: number;
  path: string;
  caption?: string | null;
}): Promise<{ success: boolean; image: GalleryImage; error?: string }> {
  const all = await getStoredGalleries();
  const gallery = all.find((g) => g.id === Number(data.gallery_id));

  if (!gallery) {
    return { success: false, error: "Galeri tidak ditemukan.", image: null as unknown as GalleryImage };
  }

  // Generate unique photo ID across all albums
  let maxImgId = 0;
  for (const g of all) {
    if (g.images) {
      for (const img of g.images) {
        if (Number(img.id) > maxImgId) maxImgId = Number(img.id);
      }
    }
  }
  const newPhotoId = maxImgId + 1;
  const now = new Date().toISOString();

  const newImage: GalleryImage = {
    id: newPhotoId,
    gallery_id: Number(data.gallery_id),
    path: data.path,
    caption: data.caption?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  if (!gallery.images) {
    gallery.images = [];
  }
  gallery.images.unshift(newImage);

  // Sync to Supabase
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("images").insert({
      id: newPhotoId,
      gallery_id: newImage.gallery_id,
      path: newImage.path,
      caption: newImage.caption,
      created_at: now,
    });
  } catch (err) {
    console.warn("Supabase insert image warning:", err);
  }

  // Save to persistent local storage
  await writeLocalGalleries(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/galeri");
  safeRevalidatePath("/admin/galeri");
  safeRevalidatePath("/admin");

  return { success: true, image: newImage };
}

/**
 * Delete a photo from a Gallery Album
 */
export async function deleteStoredGalleryPhoto(photoId: number): Promise<{ success: boolean; deletedPhoto?: GalleryImage }> {
  const all = await getStoredGalleries();
  let foundPhoto: GalleryImage | undefined;

  for (const g of all) {
    if (g.images) {
      const idx = g.images.findIndex((img) => img.id === photoId);
      if (idx !== -1) {
        foundPhoto = g.images[idx];
        g.images.splice(idx, 1);
        break;
      }
    }
  }

  // Delete from Supabase
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("images").delete().eq("id", photoId);
  } catch (err) {
    console.warn("Supabase delete image warning:", err);
  }

  // Save changes
  await writeLocalGalleries(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/galeri");
  safeRevalidatePath("/admin/galeri");
  safeRevalidatePath("/admin");

  return { success: true, deletedPhoto: foundPhoto };
}
