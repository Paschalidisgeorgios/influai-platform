"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  formatCopy,
  getDashboardCopy,
  type DashboardCopy,
  type DashboardLanguage,
} from "./i18n";
import { useLanguage } from "@/hooks/useLanguage";

type DashboardLanguageContextValue = {
  language: DashboardLanguage;
  setLanguage: (language: DashboardLanguage) => void;
  copy: DashboardCopy;
  format: typeof formatCopy;
};

const DashboardLanguageContext =
  createContext<DashboardLanguageContextValue | null>(null);

export function DashboardLanguageProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
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

/** @deprecated Prefer `useLanguage` from `@/hooks/useLanguage` */
export { useLanguage } from "@/hooks/useLanguage";
