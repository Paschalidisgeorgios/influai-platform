"use client";

import { useCallback, useEffect, useState } from "react";
import {
  APP_LANGUAGE_KEY,
  LANGUAGE_CHANGE_EVENT,
  readAppLanguage,
  writeAppLanguage,
  type AppLanguage,
} from "@/lib/i18n/language";

export type UseLanguageReturn = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  isDe: boolean;
};

export function useLanguage(): UseLanguageReturn {
  const [language, setLanguageState] = useState<AppLanguage>(() => readAppLanguage());

  useEffect(() => {
    setLanguageState(readAppLanguage());

    function onStorage(event: StorageEvent) {
      if (event.key === APP_LANGUAGE_KEY) {
        setLanguageState(readAppLanguage());
      }
    }

    function onLanguageChange() {
      setLanguageState(readAppLanguage());
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange);
    };
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    writeAppLanguage(next);
    setLanguageState(next);
  }, []);

  return {
    language,
    setLanguage,
    isDe: language === "de",
  };
}
