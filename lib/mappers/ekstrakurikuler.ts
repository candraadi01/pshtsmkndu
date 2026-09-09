import type { Ekstrakurikuler } from "@/types/content";

export interface SupabaseEkstrakurikulerRow {
  id: number;
  nama: string;
  deskripsi?: string | null;
  nama_pembina?: string | null;
  nama_ketua?: string | null;
  jadwal?: string | null;
  lokasi?: string | null;
  gambar?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function mapEkstrakurikuler(row: SupabaseEkstrakurikulerRow): Ekstrakurikuler {
  return {
    id: row.id,
    nama: row.nama,
    deskripsi: row.deskripsi ?? null,
    nama_pembina: row.nama_pembina ?? null,
    nama_ketua: row.nama_ketua ?? null,
    jadwal: row.jadwal ?? null,
    lokasi: row.lokasi ?? null,
    gambar: row.gambar ?? null,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  };
}
