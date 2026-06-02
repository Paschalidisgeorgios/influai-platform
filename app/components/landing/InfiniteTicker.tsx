"use client";

import { useReducedMotion } from "framer-motion";

type InfiniteTickerProps = {
  className?: string;
};

const TICKER_TEXT =
  "Only this week: UNLIMITED Generation Profiles · Campaign-ready AI visuals · Creator videos · Brand assets · Social ads ·";

export default function InfiniteTicker({ className = "" }: InfiniteTickerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`overflow-hidden border-y border-white/[0.06] bg-[#0A0A0B] py-3 text-white ${className}`}
      aria-label={TICKER_TEXT}
    >
      {prefersReducedMotion ? (
        <p className="px-4 text-center text-xs font-medium tracking-wide text-white/90 md:text-sm">
          {TICKER_TEXT}
        </p>
      ) : (
        <div className="landing-ticker-track flex min-w-max gap-8">
          <TickerRow />
          <TickerRow ariaHidden />
        </div>
      )}
    </div>
  );
}

function TickerRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-8"
      aria-hidden={ariaHidden || undefined}
    >
      {Array.from({ length: 2 }).map((_, copyIndex) => (
        <span
          key={copyIndex}
          className="inline-flex shrink-0 items-center gap-8 whitespace-nowrap text-xs font-medium uppercase tracking-wide text-white/90 md:text-sm"
        >
          <span>{TICKER_TEXT}</span>
          <span className="text-[#d8ad5f]" aria-hidden>
            •
          </span>
        </span>
      ))}
    </div>
  );
}
