"use client";

import Link from "next/link";
import type { AccessTier } from "@/app/lib/model-modes/types";
import { getAccessTierLabel, shouldShowUpgradeHint } from "@/app/lib/billing/access-tiers";

type Props = {
  requiredTier: AccessTier;
  userPlan?: AccessTier | string | null;
  language?: "en" | "de";
  className?: string;
  onUpgradeClick?: () => void;
};

export default function UpgradeHint({
  requiredTier,
  userPlan,
  language = "en",
  className = "",
  onUpgradeClick,
}: Props) {
  if (!shouldShowUpgradeHint(userPlan, requiredTier)) return null;

  const isDe = language === "de";
  const tierLabel = getAccessTierLabel(requiredTier, language);
  const text = isDe
    ? `${tierLabel}-Modus — Credits reichen zum Generieren`
    : `${tierLabel} mode — sufficient credits still unlock generation`;

  if (onUpgradeClick) {
    return (
      <button
        type="button"
        onClick={onUpgradeClick}
        className={`text-left text-[11px] text-neutral-500 underline-offset-2 hover:text-amber-400 hover:underline ${className}`}
      >
        {isDe ? `Upgrade auf ${tierLabel}` : `Upgrade to ${tierLabel}`} · {text}
      </button>
    );
  }

  return (
    <Link
      href="/dashboard/credits"
      className={`text-[11px] text-neutral-500 underline-offset-2 hover:text-amber-400 hover:underline ${className}`}
    >
      {isDe ? `Upgrade auf ${tierLabel}` : `Upgrade to ${tierLabel}`}
    </Link>
  );
}
