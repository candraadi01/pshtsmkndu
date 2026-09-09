import { fallbackPeople } from "@/lib/demo-data";
import { mapPerson, type SupabasePersonRow } from "@/lib/mappers/people";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import type { Person, PersonType } from "@/types/content";

export async function getPeopleByType(tipe: PersonType): Promise<Person[]> {
  const fallback = fallbackPeople.filter((p) => p.tipe === tipe);
  const client = createOptionalSupabaseClient();
  if (!client) {
    return fallback;
  }

  try {
    const { data, error } = await client
      .from("people")
      .select("id, nama, tipe, foto, sabuk, jenis_kelamin, alamat, no_hp")
      .eq("tipe", tipe)
      .order("id", { ascending: true });

    if (error) {
      // If some columns like sabuk don't exist yet, try basic columns
      const fallbackQuery = await client
        .from("people")
        .select("id, nama, tipe, foto")
        .eq("tipe", tipe)
        .order("id", { ascending: true });

      if (fallbackQuery.error || !fallbackQuery.data || fallbackQuery.data.length === 0) {
        return fallback;
      }
      return (fallbackQuery.data as SupabasePersonRow[]).map(mapPerson);
    }

    if (!data || data.length === 0) {
      return fallback;
    }

    return (data as SupabasePersonRow[]).map(mapPerson);
  } catch (error) {
    console.warn(`Supabase People service (tipe: ${tipe}) memakai fallback:`, error);
    return fallback;
  }
}
