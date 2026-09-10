import { revalidatePath } from "next/cache";

export function safeRevalidatePath(path: string, type?: "layout" | "page") {
  try {
    revalidatePath(path, type);
  } catch {
    // Gracefully ignore when called outside Next.js request context (e.g. CLI scripts, cron, background tasks)
  }
}
