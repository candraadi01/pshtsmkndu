import fs from "fs/promises";
import path from "path";
import { safeRevalidatePath } from "@/lib/services/cache-helper";
import { fallbackTipeDokumen } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { TipeDokumen, DokumenItem } from "@/types/content";

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "documents.json");

async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readLocalDocuments(): Promise<TipeDokumen[] | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as TipeDokumen[];
    return null;
  } catch {
    return null;
  }
}

async function writeLocalDocuments(categories: TipeDokumen[]): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local documents storage:", err);
  }
}

/**
 * Get all document categories with nested documents
 */
export async function getStoredDocuments(): Promise<TipeDokumen[]> {
  // 1. Try Supabase
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      const [tipeRes, docRes] = await Promise.all([
        client.from("tipe_dokumen").select("*").order("id", { ascending: true }),
        client.from("dokumen").select("*").order("id", { ascending: true }),
      ]);

      if (!tipeRes.error && tipeRes.data && tipeRes.data.length > 0) {
        const allDocs = (docRes.data as DokumenItem[] | null) ?? [];
        const mapped: TipeDokumen[] = tipeRes.data.map((td: any) => ({
          id: td.id,
          nama: td.nama,
          deskripsi: td.deskripsi,
          created_at: td.created_at,
          updated_at: td.updated_at,
          dokumen: allDocs.filter((d) => d.tipe_dokumen_id === td.id),
        }));
        await writeLocalDocuments(mapped);
        return mapped;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Read local
  const local = await readLocalDocuments();
  if (local !== null) {
    return local;
  }

  // 3. Fallback
  const initial = JSON.parse(JSON.stringify(fallbackTipeDokumen)) as TipeDokumen[];
  await writeLocalDocuments(initial);

  // Bootstrap seed to Supabase
  if (client) {
    try {
      for (const cat of initial) {
        await client.from("tipe_dokumen").upsert({
          id: cat.id,
          nama: cat.nama,
          deskripsi: cat.deskripsi,
        });
        if (cat.dokumen && cat.dokumen.length > 0) {
          for (const doc of cat.dokumen) {
            await client.from("dokumen").upsert({
              id: doc.id,
              tipe_dokumen_id: cat.id,
              nama_dokumen: doc.nama_dokumen,
              path: doc.path,
            });
          }
        }
      }
    } catch {
      // Ignore initial seed warning
    }
  }

  return initial;
}

/**
 * Save (Insert or Update) a Document Category
 */
export async function saveStoredDocumentCategory(data: {
  id?: number | null;
  nama: string;
  deskripsi?: string | null;
}): Promise<{ success: boolean; category: TipeDokumen }> {
  const all = await getStoredDocuments();
  const now = new Date().toISOString();
  let saved: TipeDokumen;

  if (data.id) {
    const existingIndex = all.findIndex((c) => c.id === Number(data.id));
    const existing = existingIndex !== -1 ? all[existingIndex] : null;

    saved = {
      id: Number(data.id),
      nama: data.nama.trim(),
      deskripsi: data.deskripsi?.trim() || null,
      dokumen: existing?.dokumen || [],
    };

    if (existingIndex !== -1) {
      all[existingIndex] = saved;
    } else {
      all.unshift(saved);
    }

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("tipe_dokumen").update({
        nama: saved.nama,
        deskripsi: saved.deskripsi,
        updated_at: now,
      }).eq("id", saved.id);
    } catch (err) {
      console.warn("Supabase update tipe_dokumen warning:", err);
    }
  } else {
    const maxId = all.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0);
    const newId = maxId + 1;

    saved = {
      id: newId,
      nama: data.nama.trim(),
      deskripsi: data.deskripsi?.trim() || null,
      dokumen: [],
    };

    all.unshift(saved);

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("tipe_dokumen").insert({
        id: newId,
        nama: saved.nama,
        deskripsi: saved.deskripsi,
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.warn("Supabase insert tipe_dokumen warning:", err);
    }
  }

  await writeLocalDocuments(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/dokumen");
  safeRevalidatePath("/admin/dokumen");
  safeRevalidatePath("/admin");

  return { success: true, category: saved };
}

/**
 * Delete a Document Category
 */
export async function deleteStoredDocumentCategory(id: number): Promise<{ success: boolean }> {
  const all = await getStoredDocuments();
  const filtered = all.filter((c) => c.id !== id);

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("dokumen").delete().eq("tipe_dokumen_id", id);
    await supabase.from("tipe_dokumen").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete tipe_dokumen warning:", err);
  }

  await writeLocalDocuments(filtered);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/dokumen");
  safeRevalidatePath("/admin/dokumen");
  safeRevalidatePath("/admin");

  return { success: true };
}

/**
 * Save (Insert or Update) a Document
 */
export async function saveStoredDocument(data: {
  id?: number | null;
  tipe_dokumen_id: number;
  nama_dokumen: string;
  path: string;
}): Promise<{ success: boolean; document: DokumenItem; error?: string }> {
  const all = await getStoredDocuments();
  const cat = all.find((c) => c.id === Number(data.tipe_dokumen_id));

  if (!cat) {
    return { success: false, error: "Kategori dokumen tidak ditemukan.", document: null as unknown as DokumenItem };
  }

  let savedDoc: DokumenItem;

  if (data.id) {
    // Update existing document
    savedDoc = {
      id: Number(data.id),
      tipe_dokumen_id: Number(data.tipe_dokumen_id),
      nama_dokumen: data.nama_dokumen.trim(),
      path: data.path,
    };

    let found = false;
    for (const c of all) {
      if (c.dokumen) {
        const idx = c.dokumen.findIndex((d) => d.id === Number(data.id));
        if (idx !== -1) {
          if (c.id === Number(data.tipe_dokumen_id)) {
            c.dokumen[idx] = savedDoc;
          } else {
            // Category changed
            c.dokumen.splice(idx, 1);
            cat.dokumen.unshift(savedDoc);
          }
          found = true;
          break;
        }
      }
    }
    if (!found) {
      cat.dokumen.unshift(savedDoc);
    }

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("dokumen").update({
        tipe_dokumen_id: savedDoc.tipe_dokumen_id,
        nama_dokumen: savedDoc.nama_dokumen,
        path: savedDoc.path,
        updated_at: new Date().toISOString(),
      }).eq("id", savedDoc.id);
    } catch (err) {
      console.warn("Supabase update dokumen warning:", err);
    }
  } else {
    // Insert new document
    let maxDocId = 0;
    for (const c of all) {
      if (c.dokumen) {
        for (const d of c.dokumen) {
          if (Number(d.id) > maxDocId) maxDocId = Number(d.id);
        }
      }
    }
    const newDocId = maxDocId + 1;

    savedDoc = {
      id: newDocId,
      tipe_dokumen_id: Number(data.tipe_dokumen_id),
      nama_dokumen: data.nama_dokumen.trim(),
      path: data.path,
    };

    if (!cat.dokumen) cat.dokumen = [];
    cat.dokumen.unshift(savedDoc);

    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("dokumen").insert({
        id: newDocId,
        tipe_dokumen_id: savedDoc.tipe_dokumen_id,
        nama_dokumen: savedDoc.nama_dokumen,
        path: savedDoc.path,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Supabase insert dokumen warning:", err);
    }
  }

  await writeLocalDocuments(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/dokumen");
  safeRevalidatePath("/admin/dokumen");
  safeRevalidatePath("/admin");

  return { success: true, document: savedDoc };
}

/**
 * Delete a Document
 */
export async function deleteStoredDocument(id: number): Promise<{ success: boolean; deleted?: DokumenItem }> {
  const all = await getStoredDocuments();
  let found: DokumenItem | undefined;

  for (const c of all) {
    if (c.dokumen) {
      const idx = c.dokumen.findIndex((d) => d.id === id);
      if (idx !== -1) {
        found = c.dokumen[idx];
        c.dokumen.splice(idx, 1);
        break;
      }
    }
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("dokumen").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete dokumen warning:", err);
  }

  await writeLocalDocuments(all);

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/dokumen");
  safeRevalidatePath("/admin/dokumen");
  safeRevalidatePath("/admin");

  return { success: true, deleted: found };
}
