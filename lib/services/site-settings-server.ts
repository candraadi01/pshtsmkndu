import "server-only";
import fs from "fs";
import path from "path";
import { defaultSiteExtendedSettings, type SiteExtendedSettings } from "./site-settings";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "public", "storage", "site-settings.json");

let cachedSettings: SiteExtendedSettings | null = null;

export function getSiteExtendedSettings(): SiteExtendedSettings {
  if (cachedSettings) return cachedSettings;

  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      cachedSettings = {
        ...defaultSiteExtendedSettings,
        ...parsed,
      };
      return cachedSettings!;
    }
  } catch (err) {
    console.warn("Failed to read site-settings.json, using defaults:", err);
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

  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    cachedSettings = updated;
  } catch (err) {
    console.error("Failed to write site-settings.json:", err);
  }

  return updated;
}
