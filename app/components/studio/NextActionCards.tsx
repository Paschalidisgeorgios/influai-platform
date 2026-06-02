"use client";

import { Lock, Loader2, Sparkles } from "lucide-react";
import LowCreditsCTA from "./LowCreditsCTA";
import {
  canAffordRevenueAction,
  getRevenueActionDescription,
  getRevenueActionLabel,
  getRevenueActionLockedReason,
  type RevenueNextAction,
} from "@/app/lib/studio/revenue-next-actions";
import type { NextActionCard } from "@/app/lib/studio/next-actions";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

export type NextActionHandler = (actionId: NextActionCard["id"]) => void;

type Props = {
  freeActions?: NextActionCard[];
  paidActions?: NextActionCard[];
  lockedActions?: NextActionCard[];
  /** Legacy flat list — used when tier lists omitted */
  actions?: NextActionCard[];
  primaryAction?: NextActionCard | null;
  smartSuggestion?: NextActionCard | null;
  showBuyCreditsCta?: boolean;
  lowCredits?: {
    show: boolean;
    nextPaidCost: number;
    missing: number;
  };
  creditBalance?: number;
  language?: "en" | "de";
  busyActionId?: string | null;
  onAction: NextActionHandler;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  className?: string;
  layout?: "grid" | "compact";
};

function asRevenueAction(card: NextActionCard): RevenueNextAction {
  return {
    id: card.id as RevenueNextAction["id"],
    tier: card.tier ?? (card.status === "locked" ? "locked" : card.isFree ? "free" : "paid"),
    label: card.label,
    description: card.description,
    creditCost: card.creditCost,
    isPrimary: card.isPrimary ?? card.status === "suggested",
    requiresCreativeScore: card.requiresCreativeScore,
    lockedReason: card.lockedReason,
    targetModelModeId: card.targetModelModeId,
  };
}

function CreditTag({
  card,
  isDe,
}: {
  card: NextActionCard;
  isDe: boolean;
}) {
  if (card.isFree || card.creditCost === 0) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-500/90">
        {isDe ? "Kostenlos" : "Free"}
      </span>
    );
  }
  return (
    <span className="text-[11px] font-bold text-amber-300/95">
      {card.creditCost} {isDe ? "Credits" : "credits"}
    </span>
  );
}

function ActionCardButton({
  card,
  isDe,
  busy,
  creditBalance,
  onClick,
}: {
  card: NextActionCard;
  isDe: boolean;
  busy?: boolean;
  creditBalance: number;
  onClick?: () => void;
}) {
  const locked = card.status === "locked";
  const revenue = asRevenueAction(card);
  const needsScore = Boolean(card.requiresCreativeScore);
  const unaffordable =
    card.tier === "paid" &&
    !locked &&
    !canAffordRevenueAction(revenue, creditBalance);
  const disabled = locked || busy || needsScore;
  const primary = card.isPrimary || card.status === "suggested";

  const label = getRevenueActionLabel(revenue, isDe ? "de" : "en");
  const description = getRevenueActionDescription(revenue, isDe ? "de" : "en");
  const lockedReason = getRevenueActionLockedReason(revenue, isDe ? "de" : "en");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full min-h-[44px] flex-col gap-1.5 rounded-2xl border border-white/10 px-4 py-3 text-left transition-[box-shadow,opacity] outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12] hover:shadow-[0_0_18px_rgba(245,158,11,0.08)] ${
        locked
          ? "cursor-not-allowed border-neutral-700/60 bg-neutral-900/40 text-neutral-400"
          : primary
            ? "bg-amber-500/12 ring-1 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:ring-2 hover:shadow-[0_0_28px_rgba(245,158,11,0.18)]"
            : unaffordable
              ? "bg-white/[0.03] opacity-90 hover:ring-1 hover:ring-amber-500/20"
              : "bg-white/[0.04] hover:ring-1 hover:ring-amber-500/25 hover:shadow-[0_0_16px_rgba(245,158,11,0.08)]"
      } ${disabled ? `${A11Y.disabled} ${locked ? "opacity-55 saturate-50" : ""}` : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-white">{label}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : locked ? (
            <Lock className="h-3.5 w-3.5 text-neutral-500" aria-hidden />
          ) : primary ? (
            <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          ) : null}
          <CreditTag card={card} isDe={isDe} />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-neutral-400">{description}</p>
      {needsScore ? (
        <p className="text-[11px] text-neutral-500">
          {isDe
            ? "Creative Score zuerst ausführen."
            : "Run Creative Score first."}
        </p>
      ) : null}
      {locked && lockedReason ? (
        <p className="text-[11px] text-neutral-500">{lockedReason}</p>
      ) : null}
      {unaffordable && !locked ? (
        <p className="text-[11px] text-amber-300/90">
          {isDe ? "Credits aufladen zum Starten." : "Add credits to run this."}
        </p>
      ) : null}
    </button>
  );
}

function ActionSection({
  title,
  cards,
  isDe,
  busyActionId,
  creditBalance,
  onAction,
  onBuyCredits,
}: {
  title: string;
  cards: NextActionCard[];
  isDe: boolean;
  busyActionId: string | null;
  creditBalance: number;
  onAction: NextActionHandler;
  onBuyCredits?: () => void;
}) {
  if (!cards.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-600">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const revenue = asRevenueAction(card);
          const unaffordable =
            card.tier === "paid" &&
            card.status !== "locked" &&
            !canAffordRevenueAction(revenue, creditBalance);

          return (
            <ActionCardButton
              key={card.id}
              card={card}
              isDe={isDe}
              busy={busyActionId === card.id}
              creditBalance={creditBalance}
              onClick={() => {
                if (unaffordable) {
                  onBuyCredits?.();
                  return;
                }
                onAction(card.id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function NextActionCards({
  freeActions = [],
  paidActions = [],
  lockedActions = [],
  actions = [],
  primaryAction,
  smartSuggestion,
  showBuyCreditsCta = false,
  lowCredits,
  creditBalance = 0,
  language = "en",
  busyActionId = null,
  onAction,
  onBuyCredits,
  onUpgrade,
  className = "",
  layout = "grid",
}: Props) {
  const isDe = language === "de";
  const primary = primaryAction ?? smartSuggestion;

  const free =
    freeActions.length > 0
      ? freeActions
      : actions.filter((a) => a.tier === "free" || a.isFree);
  const paid =
    paidActions.length > 0
      ? paidActions
      : actions.filter(
          (a) =>
            (a.tier === "paid" || (!a.isFree && a.status !== "locked")) &&
            !a.isPrimary
        );
  const locked =
    lockedActions.length > 0
      ? lockedActions
      : actions.filter((a) => a.tier === "locked" || a.status === "locked");

  const paidWithoutPrimary = paid.filter((a) => !a.isPrimary);

  if (
    !free.length &&
    !paidWithoutPrimary.length &&
    !locked.length &&
    !primary &&
    !showBuyCreditsCta &&
    !lowCredits?.show
  ) {
    return null;
  }

  if (layout === "compact") {
    const runnable = [...free, ...paidWithoutPrimary].filter(
      (a) => a.status !== "locked"
    );
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {runnable.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={card.status === "locked" || busyActionId === card.id}
            onClick={() => onAction(card.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-[box-shadow,color] hover:ring-1 hover:ring-amber-500/25"
          >
            {getRevenueActionLabel(asRevenueAction(card), isDe ? "de" : "en")}
          </button>
        ))}
      </div>
    );
  }

  const showLowCredits = lowCredits?.show ?? showBuyCreditsCta;

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
        {isDe ? "Nächste Schritte" : "Next steps"}
      </p>

      {primary ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-amber-500/80">
            {isDe ? "Empfohlen" : "Recommended"}
          </p>
          <ActionCardButton
            card={primary}
            isDe={isDe}
            busy={busyActionId === primary.id}
            creditBalance={creditBalance}
            onClick={() => {
              const revenue = asRevenueAction(primary);
              if (
                primary.tier === "paid" &&
                !canAffordRevenueAction(revenue, creditBalance)
              ) {
                onBuyCredits?.();
                return;
              }
              onAction(primary.id);
            }}
          />
        </div>
      ) : null}

      {showLowCredits ? (
        <LowCreditsCTA
          language={language}
          nextPaidCost={lowCredits?.nextPaidCost}
          balance={creditBalance}
          missingCredits={lowCredits?.missing}
          onBuyCredits={onBuyCredits}
          onUpgrade={onUpgrade}
        />
      ) : null}

      <ActionSection
        title={isDe ? "Kostenlos" : "Free"}
        cards={free}
        isDe={isDe}
        busyActionId={busyActionId}
        creditBalance={creditBalance}
        onAction={onAction}
        onBuyCredits={onBuyCredits}
      />

      <ActionSection
        title={isDe ? "Bezahlt" : "Paid"}
        cards={paidWithoutPrimary}
        isDe={isDe}
        busyActionId={busyActionId}
        creditBalance={creditBalance}
        onAction={onAction}
        onBuyCredits={onBuyCredits}
      />

      <ActionSection
        title={isDe ? "Demnächst" : "Coming soon"}
        cards={locked}
        isDe={isDe}
        busyActionId={busyActionId}
        creditBalance={creditBalance}
        onAction={onAction}
        onBuyCredits={onBuyCredits}
      />
    </div>
  );
}
