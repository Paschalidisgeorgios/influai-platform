"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  formatCopy,
  getDashboardCopy,
  LANGUAGE_STORAGE_KEY,
  readStoredLanguage,
  type DashboardCopy,
  type DashboardLanguage,
} from "./i18n";

type DashboardLanguageContextValue = {
  language: DashboardLanguage;
  setLanguage: (language: DashboardLanguage) => void;
  copy: DashboardCopy;
  format: typeof formatCopy;
};

const DashboardLanguageContext =
  createContext<DashboardLanguageContextValue | null>(null);

export function DashboardLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<DashboardLanguage>(() =>
    readStoredLanguage()
  );

  const setLanguage = useCallback((next: DashboardLanguage) => {
    setLanguageState(next);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }, []);

  const copy = useMemo(() => getDashboardCopy(language), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      copy,
      format: formatCopy,
    }),
    [language, setLanguage, copy]
  );

  return (
    <DashboardLanguageContext.Provider value={value}>
      {children}
    </DashboardLanguageContext.Provider>
  );
}

export function useDashboardLanguage() {
  const context = useContext(DashboardLanguageContext);

  if (!context) {
    throw new Error(
      "useDashboardLanguage must be used within DashboardLanguageProvider"
    );
  }

  return context;
}
