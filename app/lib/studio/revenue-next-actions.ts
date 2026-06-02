/**
 * Post-generation revenue loop — free trust builders, paid variants, locked upsell teasers.
 * No provider or raw model IDs in user-facing copy.
 */

import { getActionById, isActionActive } from "@/app/lib/actions/action-registry";
import type { ActionDefinition, ActionId } from "@/app/lib/actions/types";
import {
  FUTURE_ACTION_CREDIT_HINTS,
  getMissingCredits,
} from "@/app/lib/billing/monetization-rules";
import { resolveCreditCostForModelMode } from "@/app/lib/billing/credit-costs";
import {
  getMinCreditsForEngineIds,
  resolveEngineCredits,
} from "@/app/lib/engines/resolve-engine";

export type RevenueActionId =
  | ActionId
  | "copy_social_copy"
  | "enhance_video"
  | "make_it_premium"
  | "create_another_video";

export type RevenueActionTier = "free" | "paid" | "locked";

export type RevenueNextAction = {
  id: RevenueActionId;
  tier: RevenueActionTier;
  label: { en: string; de: string };
  description: { en: string; de: string };
  creditCost: number;
  isPrimary?: boolean;
  /** Free action waiting on Creative Score */
  requiresCreativeScore?: boolean;
  lockedReason?: { en: string; de: string };
  targetModelModeId?: string;
  targetActionId?: ActionId;
};

export type BuildRevenueNextActionsInput = {
  outputType: "image" | "video";
  modelModeId?: string | null;
  creditBalance: number;
  hasCreativeScore?: boolean;
};

export type LowCreditsState = {
  show: boolean;
  nextPaidCost: number;
  missing: number;
};

export type BuildRevenueNextActionsResult = {
  freeActions: RevenueNextAction[];
  paidActions: RevenueNextAction[];
  lockedActions: RevenueNextAction[];
  primaryAction: RevenueNextAction | null;
  lowCredits: LowCreditsState;
  /** Flat list in display order */
  allActions: RevenueNextAction[];
};

const COMING_SOON = {
  en: "Coming soon.",
  de: "Demnächst verfügbar.",
} as const;

const ANIMATE_IMAGE_LOCKED = {
  en: "Turn an existing image into motion. Coming soon.",
  de: "Bestehendes Bild in Motion verwandeln. Demnächst verfügbar.",
} as const;

const LIPSYNC_LOCKED = {
  en: "Create talking creator videos. Coming soon.",
  de: "Sprechende Creator-Videos erstellen. Demnächst verfügbar.",
} as const;

const AVATAR_LOCKED = {
  en: "Generate avatar-style creator videos. Coming soon.",
  de: "Avatar-Creator-Videos generieren. Demnächst verfügbar.",
} as const;

const ENHANCE_LOCKED = {
  en: "Upscale or clean up your asset. Coming soon.",
  de: "Asset hochskalieren oder bereinigen. Demnächst verfügbar.",
} as const;

const ENHANCE_VIDEO_LOCKED = {
  en: "Upscale or refine this video clip. Coming soon.",
  de: "Videoclip hochskalieren oder verfeinern. Demnächst verfügbar.",
} as const;

const PREMIUM_UPSELL_MODES = new Set(["auto_image", "fast_draft_image"]);

function resolveActionMinCredits(action: ActionDefinition): number {
  if (typeof action.cost === "number") return action.cost;
  if (action.defaultEngine) return resolveEngineCredits(action.defaultEngine);
  if (action.allowedEngines?.length) {
    return getMinCreditsForEngineIds(action.allowedEngines);
  }
  return 0;
}

function actionCreditCost(actionId: ActionId): number {
  const action = getActionById(actionId);
  if (!action) return 0;
  if (isActionActive(action)) return resolveActionMinCredits(action);
  return (
    FUTURE_ACTION_CREDIT_HINTS[actionId as keyof typeof FUTURE_ACTION_CREDIT_HINTS] ??
    0
  );
}

function isRunnableAction(actionId: ActionId): boolean {
  const action = getActionById(actionId);
  if (!action) return false;
  return isActionActive(action);
}

function freeAction(
  id: RevenueActionId,
  label: { en: string; de: string },
  description: { en: string; de: string },
  extra?: Partial<RevenueNextAction>
): RevenueNextAction {
  return {
    id,
    tier: "free",
    label,
    description,
    creditCost: 0,
    ...extra,
  };
}

function paidAction(
  id: RevenueActionId,
  label: { en: string; de: string },
  description: { en: string; de: string },
  creditCost: number,
  extra?: Partial<RevenueNextAction>
): RevenueNextAction {
  return {
    id,
    tier: "paid",
    label,
    description,
    creditCost,
    ...extra,
  };
}

function lockedAction(
  id: RevenueActionId,
  label: { en: string; de: string },
  description: { en: string; de: string },
  creditCost = 0,
  lockedReason: { en: string; de: string } = COMING_SOON
): RevenueNextAction {
  return {
    id,
    tier: "locked",
    label,
    description,
    creditCost,
    lockedReason,
  };
}

function buildImageRevenueActions(
  input: BuildRevenueNextActionsInput
): RevenueNextAction[] {
  const actions: RevenueNextAction[] = [];

  if (isRunnableAction("check_creative_score")) {
    actions.push(
      freeAction(
        "check_creative_score",
        { en: "Check Creative Score", de: "Creative Score prüfen" },
        {
          en: "Get feedback on clarity, composition and social readiness.",
          de: "Feedback zu Klarheit, Komposition und Social-Tauglichkeit.",
        }
      )
    );
  }

  if (isRunnableAction("export_asset")) {
    actions.push(
      freeAction(
        "export_asset",
        { en: "Export", de: "Export" },
        {
          en: "Download your generated asset.",
          de: "Lade dein generiertes Asset herunter.",
        }
      )
    );
  }

  if (isRunnableAction("create_style_variant")) {
    actions.push(
      paidAction(
        "create_style_variant",
        { en: "Create Variant", de: "Variante erstellen" },
        {
          en: "Generate another version with a different style or stronger composition.",
          de: "Generiere eine weitere Version mit anderem Stil oder stärkerer Komposition.",
        },
        actionCreditCost("create_style_variant"),
        { isPrimary: true, targetActionId: "create_style_variant" }
      )
    );
  }

  const modeId = input.modelModeId ?? "";
  if (
    PREMIUM_UPSELL_MODES.has(modeId) &&
    isRunnableAction("create_image")
  ) {
    actions.push(
      paidAction(
        "make_it_premium",
        { en: "Make it Premium", de: "Premium rendern" },
        {
          en: "Render a more polished version.",
          de: "Render eine poliertere Version.",
        },
        resolveCreditCostForModelMode("premium_image"),
        {
          targetModelModeId: "premium_image",
          targetActionId: "create_image",
        }
      )
    );
  }

  if (isRunnableAction("animate_image")) {
    actions.push(
      paidAction(
        "animate_image",
        { en: "Animate Image", de: "Bild animieren" },
        {
          en: "Turn this image into motion.",
          de: "Verwandle dieses Bild in Bewegung.",
        },
        actionCreditCost("animate_image"),
        { targetActionId: "animate_image" }
      )
    );
  } else {
    actions.push(
      lockedAction(
        "animate_image",
        { en: "Animate Image", de: "Bild animieren" },
        {
          en: "Turn this image into motion.",
          de: "Verwandle dieses Bild in Bewegung.",
        },
        actionCreditCost("animate_image"),
        ANIMATE_IMAGE_LOCKED
      )
    );
  }

  if (isRunnableAction("enhance_asset")) {
    actions.push(
      paidAction(
        "enhance_asset",
        { en: "Enhance Asset", de: "Asset verbessern" },
        {
          en: "Upscale or clean up your asset.",
          de: "Asset hochskalieren oder bereinigen.",
        },
        actionCreditCost("enhance_asset"),
        { targetActionId: "enhance_asset" }
      )
    );
  } else {
    actions.push(
      lockedAction(
        "enhance_asset",
        { en: "Enhance Asset", de: "Asset verbessern" },
        {
          en: "Upscale or clean up your asset.",
          de: "Asset hochskalieren oder bereinigen.",
        },
        actionCreditCost("enhance_asset"),
        ENHANCE_LOCKED
      )
    );
  }

  return actions;
}

function buildVideoRevenueActions(
  input: BuildRevenueNextActionsInput
): RevenueNextAction[] {
  const actions: RevenueNextAction[] = [];

  if (isRunnableAction("check_creative_score")) {
    actions.push(
      freeAction(
        "check_creative_score",
        { en: "Check Creative Score", de: "Creative Score prüfen" },
        {
          en: "Get feedback on clarity, composition and social readiness.",
          de: "Feedback zu Klarheit, Komposition und Social-Tauglichkeit.",
        }
      )
    );
  }

  actions.push(
    freeAction(
      "copy_social_copy",
      {
        en: "Copy Hooks / Captions / Hashtags",
        de: "Hooks / Captions / Hashtags kopieren",
      },
      {
        en: "Copy social-ready hooks, captions and hashtags from your score.",
        de: "Kopiere Social-Hooks, Captions und Hashtags aus deinem Score.",
      },
      {
        requiresCreativeScore: !input.hasCreativeScore,
      }
    )
  );

  if (isRunnableAction("export_asset")) {
    actions.push(
      freeAction(
        "export_asset",
        { en: "Export", de: "Export" },
        {
          en: "Download your generated asset.",
          de: "Lade dein generiertes Asset herunter.",
        }
      )
    );
  }

  const videoCost =
    resolveCreditCostForModelMode(input.modelModeId ?? "auto_video") ||
    resolveCreditCostForModelMode("auto_video") ||
    25;

  if (isRunnableAction("create_video")) {
    actions.push(
      paidAction(
        "create_another_video",
        {
          en: "Render Another Video",
          de: "Weiteres Video rendern",
        },
        {
          en: "Try a new motion direction or hook.",
          de: "Teste eine neue Motion-Richtung oder einen neuen Hook.",
        },
        videoCost,
        {
          isPrimary: true,
          targetModelModeId: input.modelModeId ?? "auto_video",
          targetActionId: "create_video",
        }
      )
    );
  }

  if (isRunnableAction("lipsync_creator")) {
    actions.push(
      paidAction(
        "lipsync_creator",
        { en: "LipSync Creator", de: "LipSync Creator" },
        {
          en: "Add lip-sync motion to creator clips.",
          de: "Füge Lip-Sync-Bewegung zu Creator-Clips hinzu.",
        },
        actionCreditCost("lipsync_creator"),
        { targetActionId: "lipsync_creator" }
      )
    );
  } else {
    actions.push(
      lockedAction(
        "lipsync_creator",
        { en: "LipSync Creator", de: "LipSync Creator" },
        {
          en: "Add lip-sync motion to creator clips.",
          de: "Füge Lip-Sync-Bewegung zu Creator-Clips hinzu.",
        },
        actionCreditCost("lipsync_creator"),
        LIPSYNC_LOCKED
      )
    );
  }

  if (isRunnableAction("ai_avatar")) {
    actions.push(
      paidAction(
        "ai_avatar",
        { en: "AI Avatar", de: "AI Avatar" },
        {
          en: "Create a talking creator avatar video.",
          de: "Erstelle ein sprechendes Creator-Avatar-Video.",
        },
        actionCreditCost("ai_avatar"),
        { targetActionId: "ai_avatar" }
      )
    );
  } else {
    actions.push(
      lockedAction(
        "ai_avatar",
        { en: "AI Avatar", de: "AI Avatar" },
        {
          en: "Create a talking creator avatar video.",
          de: "Erstelle ein sprechendes Creator-Avatar-Video.",
        },
        actionCreditCost("ai_avatar"),
        AVATAR_LOCKED
      )
    );
  }

  actions.push(
    lockedAction(
      "enhance_video",
      { en: "Enhance Video", de: "Video verbessern" },
      {
        en: "Upscale or refine this video clip.",
        de: "Skaliere hoch oder verfeinere diesen Videoclip.",
      },
      FUTURE_ACTION_CREDIT_HINTS.enhance_asset ?? 3,
      ENHANCE_VIDEO_LOCKED
    )
  );

  return actions;
}

export function buildRevenueNextActions(
  input: BuildRevenueNextActionsInput
): BuildRevenueNextActionsResult {
  const allActions =
    input.outputType === "video"
      ? buildVideoRevenueActions(input)
      : buildImageRevenueActions(input);

  const freeActions = allActions.filter((a) => a.tier === "free");
  const paidActions = allActions.filter((a) => a.tier === "paid");
  const lockedActions = allActions.filter((a) => a.tier === "locked");
  const primaryAction =
    paidActions.find((a) => a.isPrimary) ?? paidActions[0] ?? null;

  const nextPaidCost = primaryAction?.creditCost ?? 0;
  const missing = getMissingCredits(nextPaidCost, input.creditBalance);
  const lowCredits = {
    show: nextPaidCost > 0 && missing > 0,
    nextPaidCost,
    missing,
  };

  return {
    freeActions,
    paidActions,
    lockedActions,
    primaryAction,
    lowCredits,
    allActions,
  };
}

export function canAffordRevenueAction(
  action: RevenueNextAction,
  creditBalance: number
): boolean {
  if (action.tier === "free") return true;
  if (action.tier === "locked") return false;
  return creditBalance >= action.creditCost;
}

export function getRevenueActionLabel(
  action: RevenueNextAction,
  language: "en" | "de"
): string {
  return language === "de" ? action.label.de : action.label.en;
}

export function getRevenueActionDescription(
  action: RevenueNextAction,
  language: "en" | "de"
): string {
  return language === "de" ? action.description.de : action.description.en;
}

export function getRevenueActionLockedReason(
  action: RevenueNextAction,
  language: "en" | "de"
): string | undefined {
  if (!action.lockedReason) return undefined;
  return language === "de" ? action.lockedReason.de : action.lockedReason.en;
}

export const LOW_CREDITS_HEADLINE = {
  en: "Add credits to keep creating.",
  de: "Credits hinzufügen, um weiter zu erstellen.",
} as const;
