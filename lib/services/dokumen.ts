import { getStoredDocuments } from "./document-store";
import type { TipeDokumen } from "@/types/content";

export async function getTipeDokumenList(): Promise<TipeDokumen[]> {
  return await getStoredDocuments();
}

export async function getTipeDokumenById(id: number | string): Promise<TipeDokumen | null> {
  const numericId = Number(id);
  const list = await getTipeDokumenList();
  const found = list.find((item) => Number(item.id) === numericId);
  return found ?? list[0] ?? null;
}
