import "server-only";
import fs from "fs";
import path from "path";
import { defaultSiteExtendedSettings, type SiteExtendedSettings } from "./site-settings";

const PRIMARY_PATH = path.join(process.cwd(), "public", "storage", "site-settings.json");
const TMP_PATH = path.join("/tmp", "site-settings.json");

let cachedSettings: SiteExtendedSettings | null = null;

export function getSiteExtendedSettings(): SiteExtendedSettings {
  if (cachedSettings) return cachedSettings;

  // 1. Try primary path (public/storage/site-settings.json)
  try {
    if (fs.existsSync(PRIMARY_PATH)) {
      const raw = fs.readFileSync(PRIMARY_PATH, "utf-8");
      cachedSettings = {
        ...defaultSiteExtendedSettings,
        ...JSON.parse(raw),
      };
      return cachedSettings!;
    }
  } catch {
    // continue
  }

  // 2. Try /tmp path (Vercel serverless writable storage)
  try {
    if (fs.existsSync(TMP_PATH)) {
      const raw = fs.readFileSync(TMP_PATH, "utf-8");
      cachedSettings = {
        ...defaultSiteExtendedSettings,
        ...JSON.parse(raw),
      };
      return cachedSettings!;
    }
  } catch {
    // continue
  }

  cachedSettings = { ...defaultSiteExtendedSettings };
  return cachedSettings;
}

export function saveSiteExtendedSettings(
  newSettings: Partial<SiteExtendedSettings>
): SiteExtendedSettings {
  const current = getSiteExtendedSettings();
  const updated: SiteExtendedSettings = {
    ...current,
    ...newSettings,
  };

  cachedSettings = updated;

  // Try writing to primary storage first
  let saved = false;
  try {
    const dir = path.dirname(PRIMARY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_PATH, JSON.stringify(updated, null, 2), "utf-8");
    saved = true;
  } catch {
    // On Vercel, public/storage is read-only
  }

  // If primary write failed (e.g. read-only filesystem on Vercel), save to /tmp
  if (!saved) {
    try {
      fs.writeFileSync(TMP_PATH, JSON.stringify(updated, null, 2), "utf-8");
    } catch (tmpErr) {
      console.warn("Could not save to /tmp fallback:", tmpErr);
    }
  }

  return updated;
}
