"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PackageKey } from "./pricingPackages";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";

type LandingCheckoutButtonProps = {
  packageKey: PackageKey;
  language: LandingLanguage;
  label: string;
  highlighted?: boolean;
  pulseOnCardHover?: boolean;
};

export default function LandingCheckoutButton({
  packageKey,
  language,
  label,
  highlighted = false,
  pulseOnCardHover = false,
}: LandingCheckoutButtonProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = magnificContent[language].checkout;

  async function handleCheckout() {
    setError(null);
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = `/login?package=${packageKey}`;
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packageKey }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? copy.error);
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(copy.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3 font-mono text-sm font-black transition disabled:opacity-70 ${
          highlighted
            ? "bg-lime-400 text-neutral-950 shadow-[0_0_24px_rgba(163,230,53,0.35)] hover:bg-lime-500"
            : pulseOnCardHover
              ? "border border-neutral-700 bg-neutral-950 text-white group-hover:border-lime-500/50 group-hover:bg-lime-400 group-hover:text-neutral-950 group-hover:shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              : "border border-neutral-700 bg-neutral-950 text-white hover:border-amber-500/40 hover:text-amber-400"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {copy.loading}
          </>
        ) : (
          label
        )}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-red-400">
          {error}{" "}
          <Link href="/login" className="underline">
            {language === "en" ? "Sign in" : "Einloggen"}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
