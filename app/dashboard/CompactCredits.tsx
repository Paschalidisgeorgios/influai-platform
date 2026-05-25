"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CompactCreditsProps = {
  refreshKey?: number;
};

export default function CompactCredits({ refreshKey = 0 }: CompactCreditsProps) {
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
        console.error("Compact credits load error:", data.error);
        return;
      }

      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (error) {
      console.error("Compact credits error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-[9.5rem] shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:max-w-none sm:gap-2 sm:px-3 sm:py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8ad5f] text-black sm:h-8 sm:w-8">
        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      <div className="min-w-0">
        <p className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-white/35 sm:block">
          Credits
        </p>

        <p className="text-xs font-black leading-none text-white sm:text-sm">
          {loading ? "…" : credits}
        </p>
      </div>

      <button
        type="button"
        onClick={loadCredits}
        disabled={loading}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-white/20 hover:text-white disabled:opacity-40 sm:h-8 sm:w-8"
        title="Refresh credits"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
        ) : (
          <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        )}
      </button>
    </div>
  );
}
