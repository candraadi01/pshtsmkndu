import { getStoredPeople } from "./people-store";
import type { Person, PersonType } from "@/types/content";

export async function getPeopleByType(tipe: PersonType): Promise<Person[]> {
  return await getStoredPeople(tipe);
}
