import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { fallbackHomeData } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";

export interface AnnouncementRecord {
  id: number;
  judul: string;
  isi: string;
  lampiran?: string;
  created_at: string;
  updated_at?: string;
  tanggal_formatted?: string;
}

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "announcements.json");

async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readLocalAnnouncements(): Promise<AnnouncementRecord[] | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AnnouncementRecord[];
    return null;
  } catch {
    return null;
  }
}

async function writeLocalAnnouncements(items: AnnouncementRecord[]): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local announcements storage:", err);
  }
}

export async function getStoredAnnouncements(): Promise<AnnouncementRecord[]> {
  // 1. Try reading from Supabase
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("pengumuman")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const records = data as AnnouncementRecord[];
        await writeLocalAnnouncements(records);
        return records;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Try reading from local storage
  const local = await readLocalAnnouncements();
  if (local !== null) {
    return local;
  }

  // 3. Initialize from fallback data
  const initial: AnnouncementRecord[] = fallbackHomeData.announcements.map((item, idx) => ({
    id: item.id || idx + 1,
    judul: item.judul,
    isi: item.isi || "",
    lampiran: item.lampiran || "",
    created_at: item.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tanggal_formatted: (item as unknown as { tanggal_formatted?: string }).tanggal_formatted || "",
  }));

  await writeLocalAnnouncements(initial);
  return initial;
}

export async function saveStoredAnnouncement(data: { id?: number | null; judul: string; isi: string; lampiran?: string }): Promise<{ success: boolean; item?: AnnouncementRecord; error?: string }> {
  const all = await getStoredAnnouncements();
  const now = new Date().toISOString();
  let saved: AnnouncementRecord;

  if (data.id) {
    const existingIndex = all.findIndex((a) => a.id === Number(data.id));
    const existing = existingIndex !== -1 ? all[existingIndex] : null;

    saved = {
      ...(existing || {}),
      id: Number(data.id),
      judul: data.judul.trim(),
      isi: data.isi.trim(),
      lampiran: data.lampiran !== undefined ? data.lampiran : existing?.lampiran || "",
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (existingIndex !== -1) {
      all[existingIndex] = saved;
    } else {
      all.unshift(saved);
    }

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("pengumuman").update(saved).eq("id", saved.id);
    } catch (err) {
      console.warn("Supabase update pengumuman error:", err);
    }
  } else {
    const maxId = all.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0);
    saved = {
      id: maxId + 1,
      judul: data.judul.trim(),
      isi: data.isi.trim(),
      lampiran: data.lampiran || "",
      created_at: now,
      updated_at: now,
    };

    all.unshift(saved);

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("pengumuman").insert(saved);
    } catch (err) {
      console.warn("Supabase insert pengumuman error:", err);
    }
  }

  await writeLocalAnnouncements(all);

  revalidatePath("/", "layout");
  revalidatePath("/admin/pengumuman");
  revalidatePath("/admin");

  return { success: true, item: saved };
}

export async function deleteStoredAnnouncement(id: number): Promise<{ success: boolean; error?: string }> {
  const all = await getStoredAnnouncements();
  const filtered = all.filter((a) => a.id !== id);

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("pengumuman").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete pengumuman error:", err);
  }

  await writeLocalAnnouncements(filtered);

  revalidatePath("/", "layout");
  revalidatePath("/admin/pengumuman");
  revalidatePath("/admin");

  return { success: true };
}
