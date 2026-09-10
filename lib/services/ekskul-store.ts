import fs from "fs/promises";
import path from "path";
import { safeRevalidatePath } from "@/lib/services/cache-helper";
import { fallbackHomeData } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapEkstrakurikuler, type SupabaseEkstrakurikulerRow } from "@/lib/mappers/ekstrakurikuler";
import type { Ekstrakurikuler } from "@/types/content";

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "ekskul.json");

async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readLocalEkstrakurikuler(): Promise<Ekstrakurikuler[] | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Ekstrakurikuler[];
    return null;
  } catch {
    return null;
  }
}

async function writeLocalEkstrakurikuler(items: Ekstrakurikuler[]): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local ekskul storage:", err);
  }
}

/**
 * Get all extracurriculars
 */
export async function getStoredEkstrakurikuler(): Promise<Ekstrakurikuler[]> {
  // 1. Try Supabase
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("ekstrakurikuler")
        .select("*")
        .order("nama", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = (data as SupabaseEkstrakurikulerRow[]).map(mapEkstrakurikuler);
        await writeLocalEkstrakurikuler(mapped);
        return mapped;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Read local
  const local = await readLocalEkstrakurikuler();
  if (local && local.length > 0) {
    return local;
  }

  // 3. Fallback
  const initial = JSON.parse(JSON.stringify(fallbackHomeData.extracurriculars)) as Ekstrakurikuler[];
  await writeLocalEkstrakurikuler(initial);

  // Bootstrap sync to Supabase
  if (client) {
    try {
      await client.from("ekstrakurikuler").upsert(initial);
    } catch {
      // Ignore initial seed warning
    }
  }

  return initial;
}

/**
 * Save (Insert or Update) an Extracurricular
 */
export async function saveStoredEkstrakurikuler(data: Partial<Ekstrakurikuler> & { nama: string }): Promise<{ success: boolean; item: Ekstrakurikuler }> {
  const all = await getStoredEkstrakurikuler();
  const now = new Date().toISOString();
  let saved: Ekstrakurikuler;

  if (data.id) {
    const existingIndex = all.findIndex((e) => e.id === Number(data.id));
    const existing = existingIndex !== -1 ? all[existingIndex] : null;

    saved = {
      ...(existing || {}),
      ...data,
      id: Number(data.id),
      nama: data.nama.trim(),
      deskripsi: data.deskripsi !== undefined ? data.deskripsi : (existing?.deskripsi || null),
      nama_pembina: data.nama_pembina !== undefined ? data.nama_pembina : (existing?.nama_pembina || null),
      nama_ketua: data.nama_ketua !== undefined ? data.nama_ketua : (existing?.nama_ketua || null),
      jadwal: data.jadwal !== undefined ? data.jadwal : (existing?.jadwal || null),
      lokasi: data.lokasi !== undefined ? data.lokasi : (existing?.lokasi || null),
      gambar: data.gambar !== undefined ? data.gambar : (existing?.gambar || null),
      updated_at: now,
      created_at: existing?.created_at || now,
    };

    if (existingIndex !== -1) {
      all[existingIndex] = saved;
    } else {
      all.unshift(saved);
    }

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("ekstrakurikuler").update(saved).eq("id", saved.id);
    } catch (err) {
      console.warn("Supabase update ekstrakurikuler warning:", err);
    }
  } else {
    const maxId = all.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0);
    const newId = maxId + 1;

    saved = {
      ...data,
      id: newId,
      nama: data.nama.trim(),
      deskripsi: data.deskripsi || null,
      nama_pembina: data.nama_pembina || null,
      nama_ketua: data.nama_ketua || null,
      jadwal: data.jadwal || null,
      lokasi: data.lokasi || null,
      gambar: data.gambar || null,
      created_at: now,
      updated_at: now,
    };

    all.unshift(saved);

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("ekstrakurikuler").insert(saved);
    } catch (err) {
      console.warn("Supabase insert ekstrakurikuler warning:", err);
    }
  }

  await writeLocalEkstrakurikuler(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/ekstrakurikuler");
  safeRevalidatePath("/admin/ekstrakurikuler");
  safeRevalidatePath("/admin");

  return { success: true, item: saved };
}

/**
 * Delete an Extracurricular
 */
export async function deleteStoredEkstrakurikuler(id: number): Promise<{ success: boolean; deleted?: Ekstrakurikuler }> {
  const all = await getStoredEkstrakurikuler();
  const target = all.find((e) => e.id === id);
  const filtered = all.filter((e) => e.id !== id);

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("ekstrakurikuler").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete ekstrakurikuler warning:", err);
  }

  await writeLocalEkstrakurikuler(filtered);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/ekstrakurikuler");
  safeRevalidatePath("/admin/ekstrakurikuler");
  safeRevalidatePath("/admin");

  return { success: true, deleted: target };
}
