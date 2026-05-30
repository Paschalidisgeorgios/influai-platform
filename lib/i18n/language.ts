export type AppLanguage = "en" | "de";

/** Unified storage key — landing + dashboard share this preference */
export const APP_LANGUAGE_KEY = "influexai_language";

/** Legacy landing key — migrated once on read */
const LEGACY_LANDING_KEY = "influexai-landing-lang";

export const LANGUAGE_CHANGE_EVENT = "influexai:language";

export function readAppLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(APP_LANGUAGE_KEY);
  if (stored === "de" || stored === "en") return stored;

  const legacy = localStorage.getItem(LEGACY_LANDING_KEY);
  if (legacy === "de" || legacy === "en") {
    localStorage.setItem(APP_LANGUAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_LANDING_KEY);
    return legacy;
  }

  return "en";
}

export function writeAppLanguage(language: AppLanguage): void {
  localStorage.setItem(APP_LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: language }));
}
