import fs from "fs/promises";
import path from "path";
import { safeRevalidatePath } from "@/lib/services/cache-helper";
import { fallbackHomeData } from "@/lib/demo-data";
import { createOptionalSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { PageSetting } from "@/types/content";

const STORAGE_PATH = path.join(process.cwd(), "public", "storage", "page-settings.json");

async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readLocalPageSettings(): Promise<PageSetting | null> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as PageSetting;
    return null;
  } catch {
    return null;
  }
}

async function writeLocalPageSettings(settings: PageSetting): Promise<void> {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local page settings storage:", err);
  }
}

/**
 * Get page settings with Supabase and persistent local storage fallback
 */
export async function getStoredPageSettings(): Promise<PageSetting> {
  // 1. Try Supabase
  const client = createOptionalSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from("page_settings").select("*").limit(1).maybeSingle();
      if (!error && data) {
        const merged: PageSetting = {
          ...fallbackHomeData.pageSetting,
          ...data,
        };
        await writeLocalPageSettings(merged);
        return merged;
      }
    } catch {
      // Fall through to local
    }
  }

  // 2. Try Local File
  const local = await readLocalPageSettings();
  if (local) {
    return {
      ...fallbackHomeData.pageSetting,
      ...local,
    };
  }

  // 3. Fallback to default
  const initial = { ...fallbackHomeData.pageSetting };
  await writeLocalPageSettings(initial);
  return initial;
}

/**
 * Save page settings to local storage and Supabase
 */
export async function saveStoredPageSettings(settingsData: Partial<PageSetting>): Promise<{ success: boolean; settings: PageSetting }> {
  const current = await getStoredPageSettings();
  const updated: PageSetting = {
    ...current,
    ...settingsData,
  };

  // 1. Persist locally first so it never fails
  await writeLocalPageSettings(updated);

  // 2. Dual sync to Supabase
  try {
    const supabase = await createSupabaseServerClient();
    const { data: existing } = await supabase.from("page_settings").select("id").limit(1).maybeSingle();
    const payload = {
      ...updated,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      await supabase.from("page_settings").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("page_settings").insert({
        ...payload,
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Supabase page_settings sync warning:", err);
  }

  safeRevalidatePath("/", "layout");
  safeRevalidatePath("/admin/settings");
  safeRevalidatePath("/kontak");
  safeRevalidatePath("/struktur-organisasi");
  safeRevalidatePath("/admin");

  return { success: true, settings: updated };
}
