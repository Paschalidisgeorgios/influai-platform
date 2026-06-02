/**
 * @deprecated Import from `@/app/lib/studio/revenue-next-actions` for new code.
 * Thin adapter preserving legacy `NextActionCard` shape.
 */

import type { ActionId } from "@/app/lib/actions/types";
import {
  buildRevenueNextActions,
  getRevenueActionDescription,
  getRevenueActionLabel,
  getRevenueActionLockedReason,
  LOW_CREDITS_HEADLINE,
  type RevenueActionId,
  type RevenueNextAction,
} from "./revenue-next-actions";

export type NextActionId = RevenueActionId | "buy_credits";

export type NextActionStatus = "active" | "locked" | "suggested";

export type NextActionCard = {
  id: NextActionId;
  label: { en: string; de: string };
  description: { en: string; de: string };
  status: NextActionStatus;
  creditCost: number;
  isFree: boolean;
  lockedReason?: { en: string; de: string };
  targetModelModeId?: string;
  tier?: RevenueNextAction["tier"];
  isPrimary?: boolean;
  requiresCreativeScore?: boolean;
};

export type BuildNextActionsInput = {
  outputType: "image" | "video";
  modelModeId?: string | null;
  creditBalance: number;
  hasCreativeScore?: boolean;
};

export type BuildNextActionsResult = {
  actions: NextActionCard[];
  smartSuggestion: NextActionCard | null;
  showBuyCreditsCta: boolean;
  primaryAction: NextActionCard | null;
  freeActions: NextActionCard[];
  paidActions: NextActionCard[];
  lockedActions: NextActionCard[];
};

function toLegacyCard(action: RevenueNextAction): NextActionCard {
  const status: NextActionStatus =
    action.tier === "locked"
      ? "locked"
      : action.isPrimary
        ? "suggested"
        : "active";

  return {
    id: action.id,
    label: action.label,
    description: action.description,
    status,
    creditCost: action.creditCost,
    isFree: action.tier === "free",
    lockedReason: action.lockedReason,
    targetModelModeId: action.targetModelModeId,
    tier: action.tier,
    isPrimary: action.isPrimary,
    requiresCreativeScore: action.requiresCreativeScore,
  };
}

export function buildNextActions(
  input: BuildNextActionsInput
): BuildNextActionsResult {
  const revenue = buildRevenueNextActions(input);
  const actions = revenue.allActions.map(toLegacyCard);
  const primaryAction = revenue.primaryAction
    ? toLegacyCard(revenue.primaryAction)
    : null;

  return {
    actions,
    smartSuggestion: primaryAction,
    showBuyCreditsCta: revenue.lowCredits.show,
    primaryAction,
    freeActions: revenue.freeActions.map(toLegacyCard),
    paidActions: revenue.paidActions.map(toLegacyCard),
    lockedActions: revenue.lockedActions.map(toLegacyCard),
  };
}

export function getNextActionLabel(
  card: NextActionCard,
  language: "en" | "de"
): string {
  if (card.id === "buy_credits") {
    return language === "de" ? card.label.de : card.label.en;
  }
  return getRevenueActionLabel(card as RevenueNextAction, language);
}

export function getNextActionDescription(
  card: NextActionCard,
  language: "en" | "de"
): string {
  if (card.id === "buy_credits") {
    return language === "de" ? card.description.de : card.description.en;
  }
  return getRevenueActionDescription(card as RevenueNextAction, language);
}

export function getNextActionLockedReason(
  card: NextActionCard,
  language: "en" | "de"
): string | undefined {
  if (card.id === "buy_credits") return undefined;
  return getRevenueActionLockedReason(card as RevenueNextAction, language);
}

export const BUY_CREDITS_ACTION: NextActionCard = {
  id: "buy_credits",
  label: LOW_CREDITS_HEADLINE,
  description: {
    en: "Top up your balance to run the next paid action.",
    de: "Lade dein Guthaben auf, um die nächste bezahlte Aktion auszuführen.",
  },
  status: "suggested",
  creditCost: 0,
  isFree: false,
};

export type { ActionId };
