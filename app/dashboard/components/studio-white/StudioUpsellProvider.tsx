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
import CreditUpsellModal from "./CreditUpsellModal";

type StudioUpsellContextValue = {
  openUpsell: () => void;
  closeUpsell: () => void;
  handleInsufficientCredits: (status?: number, code?: string) => void;
};

const StudioUpsellContext = createContext<StudioUpsellContextValue | null>(null);

export function StudioUpsellProvider({
  children,
  credits,
  creditsLoading,
}: {
  children: ReactNode;
  credits: number;
  creditsLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const shownZeroRef = useRef(false);

  const openUpsell = useCallback(() => setOpen(true), []);
  const closeUpsell = useCallback(() => setOpen(false), []);

  const handleInsufficientCredits = useCallback(
    (status?: number, code?: string) => {
      if (status === 402 || code === "insufficient_credits") {
        openUpsell();
      }
    },
    [openUpsell]
  );

  useEffect(() => {
    if (creditsLoading || credits > 0 || shownZeroRef.current) return;
    shownZeroRef.current = true;
    openUpsell();
  }, [credits, creditsLoading, openUpsell]);

  const value = useMemo(
    () => ({ openUpsell, closeUpsell, handleInsufficientCredits }),
    [openUpsell, closeUpsell, handleInsufficientCredits]
  );

  return (
    <StudioUpsellContext.Provider value={value}>
      {children}
      <CreditUpsellModal open={open} onClose={closeUpsell} />
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
