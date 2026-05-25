"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CreditsCardProps = {
  refreshKey?: number;
};

type CreditPackage = {
  key: "starter" | "professional" | "ultimate";
  name: string;
  credits: number;
  priceLabel: string;
  description: string;
  badge?: string;
  highlight?: boolean;
};

const creditPackages: CreditPackage[] = [
  {
    key: "starter",
    name: "Starter",
    credits: 100,
    priceLabel: "100 Credits",
    description: "For testing prompts, styles and early campaign ideas.",
  },
  {
    key: "professional",
    name: "Professional",
    credits: 500,
    priceLabel: "500 Credits",
    description: "Best for regular creator visuals, ads and social campaigns.",
    badge: "Recommended",
    highlight: true,
  },
  {
    key: "ultimate",
    name: "Ultimate",
    credits: 2000,
    priceLabel: "2,000 Credits",
    description: "For high-volume content creation and production workflows.",
  },
];

export default function CreditsCard({ refreshKey = 0 }: CreditsCardProps) {
  const supabase = createClient();

  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [checkoutPackage, setCheckoutPackage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        setCredits(0);
        setErrorMessage("Please sign in again.");
        return;
      }

      const response = await fetch("/api/credits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to load credits.");
        return;
      }

      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (error) {
      console.error("Credits load error:", error);
      setErrorMessage("Failed to load credits.");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(packageKey: CreditPackage["key"]) {
    try {
      setCheckoutPackage(packageKey);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        setErrorMessage("Please sign in again.");
        return;
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
        setErrorMessage(data.error || "Failed to start checkout.");
        return;
      }

      if (!data.url) {
        setErrorMessage("Checkout URL was not returned.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMessage("Failed to start checkout.");
    } finally {
      setCheckoutPackage(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.25)]">
        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d8ad5f]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8ad5f]">
                Balance
              </p>

              <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
                Credits
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Credits are used when you generate images. One standard image
                currently uses one credit.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 text-left sm:p-5 sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/35">
                Available
              </p>

              <div className="mt-2 flex items-center gap-3 sm:justify-end">
                <CreditCard className="h-6 w-6 text-[#d8ad5f]" />

                <p className="text-4xl font-black tracking-tight text-white">
                  {loading ? "…" : credits}
                </p>
              </div>

              <button
                type="button"
                onClick={loadCredits}
                disabled={loading}
                className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="relative z-10 mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {creditPackages.map((creditPackage) => {
          const isLoading = checkoutPackage === creditPackage.key;

          return (
            <div
              key={creditPackage.key}
              className={`relative overflow-hidden rounded-[1.5rem] border p-5 shadow-[0_20px_70px_rgba(0,0,0,0.2)] sm:rounded-[2rem] sm:p-6 ${
                creditPackage.highlight
                  ? "border-[#d8ad5f]/35 bg-[#d8ad5f]/10"
                  : "border-white/10 bg-white/[0.035]"
              }`}
            >
              {creditPackage.highlight && (
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#d8ad5f]/15 blur-3xl" />
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08] text-[#d8ad5f]">
                    {creditPackage.highlight ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>

                  {creditPackage.badge && (
                    <span className="rounded-full bg-[#d8ad5f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black">
                      {creditPackage.badge}
                    </span>
                  )}
                </div>

                <h4 className="mt-6 text-2xl font-black text-white">
                  {creditPackage.name}
                </h4>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  {creditPackage.description}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-bold text-white/45">Package</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {creditPackage.priceLabel}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-[#d8ad5f]" />
                    Generate standard campaign visuals
                  </li>

                  <li className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-[#d8ad5f]" />
                    Use social media formats
                  </li>

                  <li className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-[#d8ad5f]" />
                    Save assets in your gallery
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => startCheckout(creditPackage.key)}
                  disabled={Boolean(checkoutPackage)}
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    creditPackage.highlight
                      ? "bg-[#d8ad5f] text-black hover:bg-[#efc777]"
                      : "bg-white text-black hover:bg-white/85"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening checkout...
                    </>
                  ) : (
                    "Buy credits"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}