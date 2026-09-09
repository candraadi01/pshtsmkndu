import { mapPengumuman, type SupabasePengumumanRow } from "@/lib/mappers/pengumuman";
import { getStoredAnnouncements } from "./announcement-store";
import type { Pengumuman } from "@/types/content";

export async function getAnnouncements(limit?: number): Promise<Pengumuman[]> {
  const stored = await getStoredAnnouncements();
  let list = stored.map((item) => mapPengumuman(item as unknown as SupabasePengumumanRow));

  if (typeof limit === "number" && limit > 0) {
    list = list.slice(0, limit);
  }

  return list;
}

export async function getAnnouncementById(id: number | string): Promise<Pengumuman | null> {
  const numericId = Number(id);
  if (isNaN(numericId) || numericId <= 0) return null;

  const stored = await getStoredAnnouncements();
  const item = stored.find((a) => Number(a.id) === numericId);
  if (!item) return null;

  return mapPengumuman(item as unknown as SupabasePengumumanRow);
}
