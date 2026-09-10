import fs from "fs/promises";
import path from "path";

export interface MetricsResetData {
  reset_at: string;
}

export interface LocalVisit {
  id: number;
  path: string;
  user_agent: string | null;
  created_at: string;
}

const RESET_FILE_PATH = path.join(process.cwd(), "public", "storage", "metrics-reset.json");
const VISITS_FILE_PATH = path.join(process.cwd(), "public", "storage", "visits.json");

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Get the ISO timestamp of the last metrics reset.
 */
export async function getMetricsResetTimestamp(): Promise<string | null> {
  try {
    const raw = await fs.readFile(RESET_FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as MetricsResetData;
    if (data && typeof data.reset_at === "string") {
      return data.reset_at;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the metrics reset timestamp to now (or specified ISO string).
 */
export async function setMetricsResetTimestamp(isoString?: string): Promise<string> {
  const resetAt = isoString || new Date().toISOString();
  try {
    await ensureDir(RESET_FILE_PATH);
    await fs.writeFile(
      RESET_FILE_PATH,
      JSON.stringify({ reset_at: resetAt, updated_at: new Date().toISOString() }, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Failed to write metrics-reset.json:", err);
  }
  return resetAt;
}

/**
 * Read local visits list.
 */
export async function readLocalVisits(): Promise<LocalVisit[]> {
  try {
    const raw = await fs.readFile(VISITS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LocalVisit[];
    return [];
  } catch {
    return [];
  }
}

/**
 * Record a visit in the local resilient store.
 */
export async function recordLocalVisit(visitPath: string, userAgent: string | null): Promise<void> {
  try {
    await ensureDir(VISITS_FILE_PATH);
    const visits = await readLocalVisits();
    const newVisit: LocalVisit = {
      id: Date.now(),
      path: visitPath,
      user_agent: userAgent ? userAgent.slice(0, 255) : null,
      created_at: new Date().toISOString(),
    };
    // Keep max 1000 latest visits
    const updated = [newVisit, ...visits].slice(0, 1000);
    await fs.writeFile(VISITS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to record local visit:", err);
  }
}

/**
 * Clear local visits file on reset.
 */
export async function clearLocalVisits(): Promise<void> {
  try {
    await ensureDir(VISITS_FILE_PATH);
    await fs.writeFile(VISITS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to clear local visits:", err);
  }
}
