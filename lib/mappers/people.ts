import type { Person, PersonType } from "@/types/content";

export interface SupabasePersonRow {
  id: number;
  nama: string;
  tipe: PersonType;
  foto?: string | null;
  sabuk?: string | null;
  jenis_kelamin?: string | null;
  alamat?: string | null;
  no_hp?: string | null;
}

export function mapPerson(row: SupabasePersonRow): Person {
  return {
    id: row.id,
    nama: row.nama,
    tipe: row.tipe,
    foto: row.foto ?? null,
    sabuk: row.sabuk ?? null,
    jenis_kelamin: row.jenis_kelamin ?? null,
    alamat: row.alamat ?? null,
    no_hp: row.no_hp ?? null,
  };
}
