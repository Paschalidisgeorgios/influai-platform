"use client";

import type { ReactNode } from "react";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  credits: number;
  className?: string;
  suffix?: string;
};

export default function CreditCostBadge({
  credits,
  className = "",
  suffix,
}: Props) {
  const label =
    credits === 1
      ? `1 Credit${suffix ? ` ${suffix}` : ""}`
      : `${credits} Credits${suffix ? ` ${suffix}` : ""}`;

  return (
    <span
      className={`${A11Y.creditBadge} ${className}`}
    >
      {label}
    </span>
  );
}

export function PremiumBadge({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-600 bg-neutral-800/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-200">
      {children ?? "Premium"}
    </span>
  );
}
