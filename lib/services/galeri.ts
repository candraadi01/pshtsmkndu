import { getStoredGalleries } from "./gallery-store";
import type { Gallery } from "@/types/content";

export async function getGalleries(): Promise<Gallery[]> {
  return await getStoredGalleries();
}
