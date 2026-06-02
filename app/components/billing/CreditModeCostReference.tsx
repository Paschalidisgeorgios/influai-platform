"use client";

import {
  CREDIT_MODE_COST_REFERENCES,
  getCreditUsageDisclaimer,
} from "@/app/lib/billing/credit-packages";

type Props = {
  language?: "en" | "de";
  className?: string;
  /** Hide section heading on compact surfaces */
  compact?: boolean;
};

export default function CreditModeCostReference({
  language = "en",
  className = "",
  compact = false,
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const heading = isDe ? "Credit-Kosten je Modus" : "Credit costs by mode";

  return (
    <div className={className}>
      {!compact ? (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {heading}
        </p>
      ) : null}
      <ul
        className={`grid gap-2 sm:grid-cols-2 ${compact ? "mt-0" : "mt-3"}`}
      >
        {CREDIT_MODE_COST_REFERENCES.map((mode) => (
          <li
            key={mode.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          >
            <span className="text-neutral-300">
              {isDe ? mode.labelDe : mode.labelEn}
            </span>
            <span className="shrink-0 font-bold tabular-nums text-amber-300">
              {mode.credits}{" "}
              {mode.credits === 1
                ? isDe
                  ? "Credit"
                  : "Credit"
                : isDe
                  ? "Credits"
                  : "Credits"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        {getCreditUsageDisclaimer(lang)}
      </p>
    </div>
  );
}
