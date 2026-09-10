import { getStoredEkstrakurikuler } from "./ekskul-store";
import type { Ekstrakurikuler } from "@/types/content";

export async function getExtracurriculars(): Promise<Ekstrakurikuler[]> {
  return await getStoredEkstrakurikuler();
}

export async function getExtracurricularById(id: number | string): Promise<Ekstrakurikuler | null> {
  const numericId = Number(id);
  if (isNaN(numericId) || numericId <= 0) return null;

  const list = await getStoredEkstrakurikuler();
  const found = list.find((item) => Number(item.id) === numericId);
  return found ?? null;
}
