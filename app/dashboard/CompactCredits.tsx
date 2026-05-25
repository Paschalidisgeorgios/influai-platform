"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "./DashboardLanguageProvider";
import { formatCopy } from "./i18n";

type CompactCreditsProps = {
  refreshKey?: number;
};

export default function CompactCredits({ refreshKey = 0 }: CompactCreditsProps) {
  const { copy } = useDashboardLanguage();
  const supabase = createClient();

  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, [refreshKey]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadCredits() {
    try {
      setLoading(true);

      const token = await getAccessToken();

      if (!token) {
        setCredits(0);
        return;
      }

      const response = await fetch("/api/credits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn("Compact credits load error:", data.error);
        return;
      }

      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (error) {
      console.warn("Compact credits error:", error);
    } finally {
      setLoading(false);
    }
  }

  const displayCredits = loading ? "…" : String(credits);
  const isZeroBalance = !loading && credits === 0;

  return (
    <div
      className={`flex max-w-[8.75rem] shrink-0 items-center gap-1 rounded-full border py-1 pl-1 pr-1 shadow-[0_10px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:max-w-none sm:gap-1.5 sm:py-1.5 sm:pl-1.5 sm:pr-1.5 ${
        isZeroBalance
          ? "border-amber-500/30 bg-amber-500/[0.08]"
          : "border-white/10 bg-black/75"
      }`}
      title={
        loading
          ? copy.compactCredits.loadingCredits
          : isZeroBalance
            ? copy.compactCredits.zeroCreditsHint
            : formatCopy(copy.compactCredits.creditsAvailable, { count: credits })
      }
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7 ${
          isZeroBalance ? "bg-amber-400 text-black" : "bg-[#d8ad5f] text-black"
        }`}
      >
        <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
      </div>

      <div className="min-w-0 pr-0.5">
        <p className="hidden text-[9px] font-black uppercase leading-none tracking-[0.16em] text-white/35 md:block">
          {copy.compactCredits.credits}
        </p>
        <p
          className={`text-[11px] font-black tabular-nums leading-none sm:text-xs ${
            isZeroBalance ? "text-amber-100" : "text-white"
          }`}
          aria-live="polite"
        >
          {displayCredits}
        </p>
      </div>

      <button
        type="button"
        onClick={loadCredits}
        disabled={loading}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-[#d8ad5f]/30 hover:text-[#d8ad5f] disabled:opacity-40 sm:h-7 sm:w-7"
        title={copy.compactCredits.refreshCredits}
        aria-label={copy.compactCredits.refreshCredits}
      >
        {loading ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin sm:h-3 sm:w-3" />
        ) : (
          <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        )}
      </button>
    </div>
  );
}
