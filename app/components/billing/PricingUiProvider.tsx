"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PackageKey } from "@/app/lib/billing/credit-packages";
import {
  setPendingPackage,
  syncPackageUrlParam,
} from "@/lib/billing/pending-package-checkout";
import { useLanguage } from "@/hooks/useLanguage";
import PricingModal from "./PricingModal";
import AuthCheckoutModal from "./AuthCheckoutModal";

type PricingUiContextValue = {
  openPricing: () => void;
  closePricing: () => void;
  openAuthForPackage: (packageKey: PackageKey) => void;
  closeAuth: () => void;
};

const PricingUiContext = createContext<PricingUiContextValue | null>(null);

export function usePricingUi(): PricingUiContextValue {
  const ctx = useContext(PricingUiContext);
  if (!ctx) {
    throw new Error("usePricingUi must be used within PricingUiProvider");
  }
  return ctx;
}

/** Optional hook — returns no-ops when provider is absent (e.g. tests). */
export function usePricingUiOptional(): PricingUiContextValue | null {
  return useContext(PricingUiContext);
}

type Props = {
  children: ReactNode;
  /** Override language (dashboard uses DashboardLanguageProvider separately). */
  language?: "en" | "de";
};

export default function PricingUiProvider({ children, language }: Props) {
  const { language: hookLanguage } = useLanguage();
  const lang = language ?? (hookLanguage === "de" ? "de" : "en");

  const [pricingOpen, setPricingOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPackageKey, setAuthPackageKey] = useState<PackageKey | null>(null);

  const openPricing = useCallback(() => {
    setAuthOpen(false);
    setPricingOpen(true);
  }, []);

  const closePricing = useCallback(() => setPricingOpen(false), []);

  const openAuthForPackage = useCallback((packageKey: PackageKey) => {
    setPendingPackage(packageKey);
    syncPackageUrlParam(packageKey);
    setPricingOpen(false);
    setAuthPackageKey(packageKey);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    // Keep sessionStorage + URL package — user may reopen auth to continue.
  }, []);

  const value = useMemo(
    () => ({
      openPricing,
      closePricing,
      openAuthForPackage,
      closeAuth,
    }),
    [openPricing, closePricing, openAuthForPackage, closeAuth]
  );

  return (
    <PricingUiContext.Provider value={value}>
      {children}
      <PricingModal open={pricingOpen} onClose={closePricing} language={lang} />
      <AuthCheckoutModal
        open={authOpen}
        onClose={closeAuth}
        packageKey={authPackageKey}
        language={lang}
      />
    </PricingUiContext.Provider>
  );
}
