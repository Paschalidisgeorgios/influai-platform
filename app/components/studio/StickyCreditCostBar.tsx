"use client";



import { Loader2 } from "lucide-react";

import {

  canAffordGeneration,

  getMissingCredits,

} from "@/app/lib/billing/monetization-rules";

import {

  CREDITS_PAGE,

  getNeedMoreCreditsMessage,

  getStickyRenderCtaLabel,

  REFUND_REASSURANCE,

  STICKY_CREDIT_BAR,

} from "@/lib/copy/launch-user-copy";

import { A11Y } from "@/lib/obsidian/a11y-tokens";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";



export type StickyCreditWorkflow = "image" | "video" | "pack" | "copy" | "export";



type Props = {

  modeLabel: string;

  creditCost: number;

  creditBalance: number;

  language?: "en" | "de";

  workflow: StickyCreditWorkflow;

  /** Pack workflow — e.g. "Render Pack · 45 Credits" */

  packCtaLabel?: string;

  /** When false, paid render CTAs stay disabled (balance not confirmed). */

  creditsConfirmed?: boolean;

  isGenerating?: boolean;

  actionDisabled?: boolean;

  onPrimaryAction: () => void;

  onBuyCredits: () => void;

  /** docked = inside studio shell footer; fixed = viewport overlay (legacy) */

  variant?: "docked" | "fixed";

  className?: string;

};



export default function StickyCreditCostBar({

  modeLabel,

  creditCost,

  creditBalance,

  language = "en",

  workflow,

  packCtaLabel,

  isGenerating = false,

  creditsConfirmed = true,

  actionDisabled = false,

  onPrimaryAction,

  onBuyCredits,

  variant = "docked",

  className = "",

}: Props) {

  const lang = language === "de" ? "de" : "en";

  const isDe = lang === "de";

  const locale = isDe ? "de-DE" : "en-US";

  const canAfford =

    workflow === "copy" || workflow === "export"

      ? true

      : creditsConfirmed && canAffordGeneration(creditCost, creditBalance);

  const missing = getMissingCredits(creditCost, creditBalance);

  const renderLabel = getStickyRenderCtaLabel({

    creditCost,

    language: lang,

    workflow,

    packCtaLabel,

  });



  const primaryDisabled =

    workflow === "copy" || workflow === "export"

      ? actionDisabled || isGenerating

      : actionDisabled ||

        isGenerating ||

        !creditsConfirmed ||

        !canAfford ||

        creditCost <= 0;



  const panel = (

    <div

      className={

        variant === "docked"

          ? `w-full px-2 py-2 sm:px-4 sm:py-3 ${className}`

          : `pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-white/[0.1] bg-[#0E1220]/95 p-3 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-4 ${className}`

      }

    >

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">

        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:gap-4">

          <div className="min-w-0">

            <p className={`${A11Y.mutedLabel} text-[9px] sm:text-[10px]`}>

              {STICKY_CREDIT_BAR.mode[lang]}

            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-white sm:text-sm">

              {modeLabel}

            </p>

          </div>

          <div>

            <p className={`${A11Y.mutedLabel} text-[9px] sm:text-[10px]`}>

              {CREDITS_PAGE.estimatedCost[lang]}

            </p>

            <p className="mt-0.5 text-[11px] font-bold text-amber-200 sm:text-sm">

              {workflow === "copy" || workflow === "export"

                ? isDe

                  ? "Kostenlos"

                  : "Free"

                : `${creditCost.toLocaleString(locale)} ${isDe ? "Credits" : "credits"}`}

            </p>

          </div>

          <div>

            <p className={`${A11Y.mutedLabel} text-[9px] sm:text-[10px]`}>

              {STICKY_CREDIT_BAR.available[lang]}

            </p>

            <p

              className={`mt-0.5 text-[11px] font-bold sm:text-sm ${

                !creditsConfirmed

                  ? "text-neutral-400"

                  : canAfford

                    ? "text-white"

                    : "text-red-300"

              }`}

            >

              {!creditsConfirmed

                ? "—"

                : `${creditBalance.toLocaleString(locale)} ${isDe ? "Credits" : "credits"}`}

            </p>

          </div>

        </div>



        <div className="flex shrink-0 flex-row gap-2 sm:min-w-[13rem] sm:flex-col">

          <button

            type="button"

            onClick={onPrimaryAction}

            disabled={primaryDisabled}

            className={`${obsidianButtonClass("primary", { size: "sm" })} ${A11Y.disabled} flex-1 sm:flex-none disabled:bg-amber-500/40 disabled:text-neutral-800`}

          >

            {isGenerating ? (

              <>

                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />

                {isDe ? "Läuft…" : "Running…"}

              </>

            ) : (

              renderLabel

            )}

          </button>



          {!canAfford ? (

            <button

              type="button"

              onClick={onBuyCredits}

              className={`${obsidianButtonClass("secondary", { size: "sm" })} flex-1 text-[11px] sm:flex-none`}

            >

              {CREDITS_PAGE.buyCredits[lang]}

            </button>

          ) : null}

        </div>

      </div>



      {!canAfford && missing > 0 && creditsConfirmed ? (

        <p className="mt-1.5 text-[11px] font-medium text-red-300/90 sm:mt-2 sm:text-xs" role="status">

          {getNeedMoreCreditsMessage(missing, lang)}

        </p>

      ) : null}



      <p className={`mt-1.5 hidden text-center sm:mt-2 sm:block ${A11Y.mutedCaption}`}>

        {REFUND_REASSURANCE[lang]}

      </p>

    </div>

  );



  if (variant === "docked") {

    return (

      <div

        role="region"

        aria-label={isDe ? "Credit-Kosten" : "Credit cost"}

      >

        {panel}

      </div>

    );

  }



  return (

    <div

      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4 ${className}`}

      role="region"

      aria-label={isDe ? "Credit-Kosten" : "Credit cost"}

    >

      {panel}

    </div>

  );

}

