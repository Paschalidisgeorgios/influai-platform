"use client";

import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useLanguage } from "@/hooks/useLanguage";

type Props = {
  creditCost: number;
  /** Short label for what is being priced, e.g. "Image" or "Video 5s" */
  costLabel?: string;
};

function formatCredits(value: number, locale: string) {
  return value.toLocaleString(locale);
}

export default function StudioCreditMeter({ creditCost, costLabel }: Props) {
  const { credits, creditsLoading } = useCreativeSuite();
  const { isDe } = useLanguage();
  const locale = isDe ? "de-DE" : "en-US";

  const canAfford = credits >= creditCost;
  const creditsAfter = canAfford ? credits - creditCost : 0;
  const shortfall = canAfford ? 0 : creditCost - credits;

  const copy = isDe
    ? {
        balance: "Guthaben",
        cost: costLabel ? `Kosten (${costLabel})` : "Kosten",
        after: "Danach",
        statusOk: "Genug Credits",
        statusLow: `${shortfall} Credits fehlen`,
        loading: "Credits werden geladen …",
      }
    : {
        balance: "Balance",
        cost: costLabel ? `Cost (${costLabel})` : "Cost",
        after: "After",
        statusOk: "Enough credits",
        statusLow: `${shortfall} credits short`,
        loading: "Loading credits …",
      };

  if (creditsLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-800/80 bg-neutral-950/50 px-4 py-3 text-center text-xs text-neutral-500">
        {copy.loading}
      </div>
    );
  }

  return (
    <div
      className={`mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 rounded-2xl border px-4 py-3 sm:grid-cols-4 sm:gap-4 ${
        canAfford
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {copy.balance}
        </p>
        <p className="mt-0.5 text-sm font-bold text-amber-300">
          ⚡ {formatCredits(credits, locale)}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {copy.cost}
        </p>
        <p className="mt-0.5 text-sm font-bold text-white">
          −{formatCredits(creditCost, locale)}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {copy.after}
        </p>
        <p className={`mt-0.5 text-sm font-bold ${canAfford ? "text-neutral-200" : "text-neutral-500"}`}>
          {canAfford ? formatCredits(creditsAfter, locale) : "—"}
        </p>
      </div>
      <div className="col-span-2 flex items-center sm:col-span-1">
        <span
          className={`inline-flex w-full items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold sm:w-auto ${
            canAfford
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {canAfford ? copy.statusOk : copy.statusLow}
        </span>
      </div>
    </div>
  );
}
