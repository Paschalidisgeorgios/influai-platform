"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import UpgradeOrBuyCreditsModal, {
  type UpgradeOrBuyCreditsContext,
} from "@/app/components/billing/UpgradeOrBuyCreditsModal";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

export type UpsellOpenOptions = UpgradeOrBuyCreditsContext;

type StudioUpsellContextValue = {
  openUpsell: (options?: UpsellOpenOptions) => void;
  closeUpsell: () => void;
  handleInsufficientCredits: (
    status?: number,
    code?: string,
    options?: UpsellOpenOptions
  ) => void;
};

const StudioUpsellContext = createContext<StudioUpsellContextValue | null>(null);

export function StudioUpsellProvider({
  children,
  credits,
  creditsLoading,
  creditsError = false,
}: {
  children: ReactNode;
  credits: number;
  creditsLoading: boolean;
  creditsError?: boolean;
}) {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const [open, setOpen] = useState(false);
  const [upsellContext, setUpsellContext] = useState<UpsellOpenOptions>({});
  const shownZeroRef = useRef(false);

  const openUpsell = useCallback(
    (options?: UpsellOpenOptions) => {
      setUpsellContext({
        balance: credits,
        ...options,
      });
      setOpen(true);
    },
    [credits]
  );

  const closeUpsell = useCallback(() => {
    setOpen(false);
    setUpsellContext({});
  }, []);

  const handleInsufficientCredits = useCallback(
    (status?: number, code?: string, options?: UpsellOpenOptions) => {
      const normalized = code?.toUpperCase();
      if (
        status === 402 ||
        normalized === "INSUFFICIENT_CREDITS" ||
        code === "insufficient_credits"
      ) {
        openUpsell(options);
      }
    },
    [openUpsell]
  );

  useEffect(() => {
    if (creditsLoading || creditsError || credits > 0 || shownZeroRef.current) return;
    shownZeroRef.current = true;
    openUpsell({ balance: 0, requiredCredits: 1 });
  }, [credits, creditsLoading, creditsError, openUpsell]);

  const value = useMemo(
    () => ({ openUpsell, closeUpsell, handleInsufficientCredits }),
    [openUpsell, closeUpsell, handleInsufficientCredits]
  );

  return (
    <StudioUpsellContext.Provider value={value}>
      {children}
      <UpgradeOrBuyCreditsModal
        open={open}
        onClose={closeUpsell}
        language={lang}
        context={{ balance: credits, ...upsellContext }}
      />
    </StudioUpsellContext.Provider>
  );
}

export function useStudioUpsell() {
  const ctx = useContext(StudioUpsellContext);
  if (!ctx) {
    throw new Error("useStudioUpsell must be used within StudioUpsellProvider");
  }
  return ctx;
}
