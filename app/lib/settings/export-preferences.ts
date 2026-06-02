import type { ExportFormatPref } from "@/lib/copy/settings-copy";

const STORAGE_KEY = "influexai-export-format-pref";

const VALID: ExportFormatPref[] = ["tiktok", "reels", "story", "feed"];

export function readExportFormatPref(): ExportFormatPref | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || !VALID.includes(raw as ExportFormatPref)) return null;
    return raw as ExportFormatPref;
  } catch {
    return null;
  }
}

export function writeExportFormatPref(value: ExportFormatPref): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore quota / private mode */
  }
}
