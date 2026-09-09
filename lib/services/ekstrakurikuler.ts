import { fallbackHomeData } from "@/lib/demo-data";
import { mapEkstrakurikuler, type SupabaseEkstrakurikulerRow } from "@/lib/mappers/ekstrakurikuler";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import type { Ekstrakurikuler } from "@/types/content";

export async function getExtracurriculars(): Promise<Ekstrakurikuler[]> {
  const client = createOptionalSupabaseClient();
  if (!client) {
    return fallbackHomeData.extracurriculars;
  }

  try {
    const { data, error } = await client
      .from("ekstrakurikuler")
      .select("id, nama, deskripsi, nama_pembina, nama_ketua, jadwal, lokasi, gambar, created_at, updated_at")
      .order("nama", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return fallbackHomeData.extracurriculars;
    }

    return (data as SupabaseEkstrakurikulerRow[]).map(mapEkstrakurikuler);
  } catch (error) {
    console.warn("Supabase Ekstrakurikuler service memakai fallback:", error);
    return fallbackHomeData.extracurriculars;
  }
}

export async function getExtracurricularById(id: number | string): Promise<Ekstrakurikuler | null> {
  const numericId = Number(id);
  if (isNaN(numericId) || numericId <= 0) return null;

  const client = createOptionalSupabaseClient();
  if (!client) {
    const fallback = fallbackHomeData.extracurriculars.find((item) => Number(item.id) === numericId);
    return fallback ?? null;
  }

  try {
    const { data, error } = await client
      .from("ekstrakurikuler")
      .select("id, nama, deskripsi, nama_pembina, nama_ketua, jadwal, lokasi, gambar, created_at, updated_at")
      .eq("id", numericId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return mapEkstrakurikuler(data as SupabaseEkstrakurikulerRow);
    }

    const fallback = fallbackHomeData.extracurriculars.find((item) => Number(item.id) === numericId);
    return fallback ?? null;
  } catch (error) {
    console.warn(`Supabase Ekstrakurikuler service (id: ${id}) memakai fallback:`, error);
    const fallback = fallbackHomeData.extracurriculars.find((item) => Number(item.id) === numericId);
    return fallback ?? null;
  }
}
