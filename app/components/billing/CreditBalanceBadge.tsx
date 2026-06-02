"use client";

import { CREDITS_LOAD_STATE, CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  balance: number;
  loading?: boolean;
  error?: boolean;
  language?: "en" | "de";
  className?: string;
  onClick?: () => void;
  onRetry?: () => void;
  /** Highlight when balance is too low for the current action */
  low?: boolean;
};

export default function CreditBalanceBadge({
  balance,
  loading = false,
  error = false,
  language = "en",
  className = "",
  onClick,
  onRetry,
  low = false,
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const formatted = balance.toLocaleString(isDe ? "de-DE" : "en-US");
  const label = CREDITS_PAGE.balance[lang];

  const classes = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12] ${
    low
      ? "border-red-500/40 bg-red-500/15 text-red-100"
      : "border-amber-500/35 bg-amber-500/12 text-neutral-100 hover:border-amber-500/55"
  } ${className}`;

  if (loading) {
    return (
      <span
        className={`${classes} min-h-[2rem] min-w-[7.5rem] border-white/10 bg-white/[0.04] px-3 py-2`}
        aria-busy="true"
        aria-label={isDe ? "Credits werden geladen" : "Loading credits"}
      >
        <span className="inline-flex h-2.5 w-full max-w-[6.5rem] animate-pulse rounded-full bg-white/10" />
      </span>
    );
  }

  if (error) {
    return (
      <span
        className={`flex w-full flex-col items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center ${className}`}
        role="status"
      >
        <span className="text-[11px] leading-snug text-neutral-400">
          {CREDITS_LOAD_STATE.loadFailed[lang]}
        </span>
        {onRetry ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRetry();
            }}
            className={`text-[11px] font-semibold text-amber-300 underline-offset-2 hover:text-amber-200 hover:underline ${A11Y.focusRing}`}
          >
            {CREDITS_LOAD_STATE.retry[lang]}
          </button>
        ) : null}
      </span>
    );
  }

  const inner = (
    <>
      <span className={low ? "text-red-400" : "text-amber-400"} aria-hidden>
        ⚡
      </span>
      <span>
        {label}:{" "}
        <strong className={low ? "text-red-100" : "text-amber-200"}>{formatted}</strong>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${classes} ${A11Y.touchTargetSm}`}>
        {inner}
      </button>
    );
  }

  return <span className={classes}>{inner}</span>;
}
