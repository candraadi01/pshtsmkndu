import fs from "fs/promises";
import path from "path";
import { safeRevalidatePath } from "@/lib/services/cache-helper";
import { fallbackPeople } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { Person, PersonType } from "@/types/content";

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "people.json");

async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readLocalPeople(): Promise<Person[] | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Person[];
    return null;
  } catch {
    return null;
  }
}

async function writeLocalPeople(people: Person[]): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(people, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local people storage:", err);
  }
}

/**
 * Get all people, optionally filtered by type (pelatih, warga, siswa)
 */
export async function getStoredPeople(tipe?: string): Promise<Person[]> {
  // 1. Try reading from Supabase
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      let query = client.from("people").select("*").order("created_at", { ascending: false });
      if (tipe) {
        query = query.eq("tipe", tipe);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const records = data as Person[];
        // If query was for all, update local storage cache
        if (!tipe) {
          await writeLocalPeople(records);
        }
        return records;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Read from persistent local JSON
  let local = await readLocalPeople();
  if (!local || local.length === 0) {
    // 3. Initialize from fallbackPeople
    local = JSON.parse(JSON.stringify(fallbackPeople)) as Person[];
    await writeLocalPeople(local);

    // Bootstrap sync to Supabase
    if (client) {
      try {
        await client.from("people").upsert(local);
      } catch {
        // Ignore seed warning
      }
    }
  }

  if (tipe) {
    return local.filter((p) => p.tipe === tipe);
  }
  return local;
}

/**
 * Save (Insert or Update) a Person
 */
export async function saveStoredPerson(personData: Partial<Person> & { nama: string; tipe: string }): Promise<{ success: boolean; person: Person }> {
  const all = await getStoredPeople();
  const now = new Date().toISOString();
  let saved: Person;

  if (personData.id) {
    const existingIndex = all.findIndex((p) => p.id === Number(personData.id));
    const existing = existingIndex !== -1 ? all[existingIndex] : null;

    saved = {
      ...(existing || {}),
      ...personData,
      id: Number(personData.id),
      nama: personData.nama.trim(),
      tipe: (personData.tipe.trim() as PersonType),
      foto: personData.foto !== undefined ? personData.foto : (existing?.foto || null),
      sabuk: personData.sabuk !== undefined ? personData.sabuk : (existing?.sabuk || null),
      jenis_kelamin: personData.jenis_kelamin !== undefined ? personData.jenis_kelamin : (existing?.jenis_kelamin || null),
      alamat: personData.alamat !== undefined ? personData.alamat : (existing?.alamat || null),
      no_hp: personData.no_hp !== undefined ? personData.no_hp : (existing?.no_hp || null),
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
      await supabase.from("people").update(saved).eq("id", saved.id);
    } catch (err) {
      console.warn("Supabase update people warning:", err);
    }
  } else {
    const maxId = all.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
    const newId = maxId + 1;

    saved = {
      ...personData,
      id: newId,
      nama: personData.nama.trim(),
      tipe: (personData.tipe.trim() as PersonType),
      foto: personData.foto || null,
      sabuk: personData.sabuk || null,
      jenis_kelamin: personData.jenis_kelamin || null,
      alamat: personData.alamat || null,
      no_hp: personData.no_hp || null,
      created_at: now,
      updated_at: now,
    };

    all.unshift(saved);

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("people").insert(saved);
    } catch (err) {
      console.warn("Supabase insert people warning:", err);
    }
  }

  await writeLocalPeople(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/pelatih");
  safeRevalidatePath("/warga");
  safeRevalidatePath("/siswa");
  safeRevalidatePath("/admin/people");
  safeRevalidatePath("/admin");

  return { success: true, person: saved };
}

/**
 * Delete a Person
 */
export async function deleteStoredPerson(id: number): Promise<{ success: boolean; deleted?: Person }> {
  const all = await getStoredPeople();
  const target = all.find((p) => p.id === id);
  const filtered = all.filter((p) => p.id !== id);

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("people").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete people warning:", err);
  }

  await writeLocalPeople(filtered);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/pelatih");
  safeRevalidatePath("/warga");
  safeRevalidatePath("/siswa");
  safeRevalidatePath("/admin/people");
  safeRevalidatePath("/admin");

  return { success: true, deleted: target };
}
