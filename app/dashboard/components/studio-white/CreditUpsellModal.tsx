"use client";



import { useState } from "react";

import Link from "next/link";

import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { KG } from "@/lib/kinetic-glass/classes";

import { formatEurPrice } from "@/app/components/landing/pricingPackages";

import { useDashboardLanguage } from "../../DashboardLanguageProvider";



type Props = {

  open: boolean;

  onClose: () => void;

};



export default function CreditUpsellModal({ open, onClose }: Props) {

  const { language } = useDashboardLanguage();

  const isDe = language === "de";

  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);



  async function startCheckout() {

    setError(null);

    setLoading(true);

    try {

      const {

        data: { session },

      } = await supabase.auth.getSession();



      if (!session?.access_token) {

        window.location.href = "/login?package=professional";

        return;

      }



      const response = await fetch("/api/stripe/checkout", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${session.access_token}`,

        },

        body: JSON.stringify({ packageKey: "professional" }),

      });



      const data = (await response.json()) as { url?: string; error?: string };



      if (!response.ok || !data.url) {

        setError(

          data.error ??

            (isDe

              ? "Checkout fehlgeschlagen. Bitte erneut versuchen."

              : "Checkout failed. Please try again.")

        );

        setLoading(false);

        return;

      }



      window.location.href = data.url;

    } catch {

      setError(

        isDe

          ? "Checkout fehlgeschlagen. Bitte erneut versuchen."

          : "Checkout failed. Please try again."

      );

      setLoading(false);

    }

  }



  if (!open) return null;



  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">

      <div role="dialog" aria-modal="true" className={`w-full max-w-md ${KG.glassFloat}`}>

        <h2 className="text-xl font-extrabold uppercase italic tracking-tighter text-white">

          {isDe ? "Credits aufladen" : "Top up credits"}

        </h2>

        <p className="mt-4 text-sm leading-relaxed text-neutral-400">

          {isDe

            ? "Deine Credits sind aufgebraucht. Lade das Professional-Paket (500 Credits) auf und setze die Produktion sofort fort."

            : "You're out of credits. Top up with the Professional pack (500 credits) and keep producing without interruption."}

        </p>

        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-amber-400">

          Professional · {formatEurPrice(29)} · 500 Credits

        </p>

        <div className="mt-6 flex flex-wrap gap-3">

          <button

            type="button"

            onClick={() => void startCheckout()}

            disabled={loading}

            className={`px-5 py-2.5 text-sm ${KG.amberBtn} disabled:opacity-70`}

          >

            {loading ? (

              <span className="inline-flex items-center gap-2">

                <Loader2 className="h-4 w-4 animate-spin" />

                {isDe ? "Checkout wird geöffnet…" : "Opening checkout…"}

              </span>

            ) : isDe ? (

              "Jetzt aufladen"

            ) : (

              "Top up now"

            )}

          </button>

          <Link

            href="/dashboard/credits"

            onClick={onClose}

            className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-400 hover:border-amber-500/50 hover:text-amber-400"

          >

            {isDe ? "Alle Pakete" : "All packages"}

          </Link>

          <button

            type="button"

            onClick={onClose}

            className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-400 hover:border-white/30 hover:text-white"

          >

            {isDe ? "Später" : "Later"}

          </button>

        </div>

        {error ? (

          <p className="mt-4 text-xs font-medium text-red-400">

            {error}{" "}

            <Link href="/login" className="underline">

              {isDe ? "Einloggen" : "Sign in"}

            </Link>

          </p>

        ) : null}

      </div>

    </div>

  );

}


