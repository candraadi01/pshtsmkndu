import { fallbackTipeDokumen } from "@/lib/demo-data";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import type { DokumenItem, TipeDokumen } from "@/types/content";

export async function getTipeDokumenList(): Promise<TipeDokumen[]> {
  const client = createOptionalSupabaseClient();
  if (!client) {
    return fallbackTipeDokumen;
  }

  try {
    const [tipeRes, docRes] = await Promise.all([
      client.from("tipe_dokumen").select("*").order("id", { ascending: true }),
      client.from("dokumen").select("*").order("id", { ascending: true }),
    ]);

    if (tipeRes.error || !tipeRes.data || tipeRes.data.length === 0) {
      return fallbackTipeDokumen;
    }

    const allDocs = (docRes.data as DokumenItem[] | null) ?? [];

    const result: TipeDokumen[] = tipeRes.data.map((td) => ({
      id: td.id,
      nama: td.nama,
      deskripsi: td.deskripsi,
      created_at: td.created_at,
      updated_at: td.updated_at,
      dokumen: allDocs.filter((d) => d.tipe_dokumen_id === td.id),
    }));

    return result;
  } catch (error) {
    console.warn("Supabase Dokumen service memakai fallback:", error);
    return fallbackTipeDokumen;
  }
}

export async function getTipeDokumenById(id: number | string): Promise<TipeDokumen | null> {
  const numericId = Number(id);
  const list = await getTipeDokumenList();
  const found = list.find((item) => Number(item.id) === numericId);
  return found ?? list[0] ?? null;
}
