"use client";

import { useEffect, useState } from "react";
import { CreditCard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CreditsCardProps = {
  refreshKey?: number;
};

type CreditPackage = "starter" | "professional" | "ultimate";

export default function CreditsCard({
  refreshKey = 0,
}: CreditsCardProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] =
    useState<CreditPackage | null>(null);

  const supabase = createClient();

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
        throw new Error("No active session");
      }

      const response = await fetch("/api/credits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load credits");
      }

      setCredits(data.credits ?? 0);
    } catch (error) {
      console.error("Credits load error:", error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(packageKey: CreditPackage) {
    try {
      setCheckoutLoading(packageKey);

      const token = await getAccessToken();

      if (!token) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (!data.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
            Balance
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {loading ? "..." : credits}
            <span className="ml-2 text-lg font-bold text-white/40">
              Credits
            </span>
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            disabled={checkoutLoading !== null}
            onClick={() => startCheckout("starter")}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left transition hover:border-white/25 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <CreditCard className="h-4 w-4" />
              Starter
            </div>

            <p className="mt-2 text-xs text-white/45">
              100 Credits
            </p>
          </button>

          <button
            type="button"
            disabled={checkoutLoading !== null}
            onClick={() => startCheckout("professional")}
            className="rounded-2xl border border-white/10 bg-white px-5 py-4 text-left transition hover:bg-white/90 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-sm font-black text-black">
              <Sparkles className="h-4 w-4" />
              Professional
            </div>

            <p className="mt-2 text-xs text-black/60">
              500 Credits
            </p>
          </button>

          <button
            type="button"
            disabled={checkoutLoading !== null}
            onClick={() => startCheckout("ultimate")}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left transition hover:border-white/25 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <CreditCard className="h-4 w-4" />
              Ultimate
            </div>

            <p className="mt-2 text-xs text-white/45">
              2000 Credits
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}