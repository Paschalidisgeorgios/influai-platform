/**
 * InfluExAI — creator tool registry (user-facing workflows, no provider ids).
 *
 * Activation audit: docs/MODEL_ACTIVATION_STATUS.md
 * Runtime resolution: resolve-tool.ts + tool-activation.ts
 * Do not mark a tool live unless evaluateToolActivation + assertToolCanRun pass.
 */

import { isCreatorToolLaunchGateOpen } from "./launch-tool-gate";

/**
 * Social Asset Pack is live when deployed (client-safe) or server keys exist.
 * Does not use engine registry / isEngineActive.
 */
export function isSocialAssetPackDeploymentReady(): boolean {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) return true;
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.KREA_API_KEY?.trim()) return true;
  if (process.env.FAL_KEY?.trim()) return true;
  return false;
}

export function isSocialAssetPackForceLive(tool: CreatorToolDefinition): boolean {
  return (
    tool.id === "social_asset_pack" &&
    isCreatorToolLaunchGateOpen(tool) &&
    isSocialAssetPackDeploymentReady()
  );
}
import { getActionById } from "@/app/lib/actions/action-registry";
import type { ActionId } from "@/app/lib/actions/types";
import type { LaunchConfig, LaunchModuleKey } from "@/app/lib/config/launch";
import { getEngineById, isEngineActive } from "@/app/lib/engines/catalog";
import { resolveEngineCredits } from "@/app/lib/engines/resolve-engine";
import { getCreatorToolCreditCost } from "@/app/lib/billing/tool-credit-costs";
import { getSocialAssetPackTotalCredits } from "@/app/lib/packs/social-asset-pack";
import { ANIMATE_IMAGE_CREDITS, ANIMATE_IMAGE_ENGINE_ID } from "@/app/lib/animate/animate-image-config";
import {
  LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
  LIPSYNC_CREATOR_ENGINE_ID,
} from "@/app/lib/lipsync/lipsync-creator-config";
import {
  AI_AVATAR_CREDITS_MIN,
  AI_AVATAR_ENGINE_ID,
} from "@/app/lib/avatar/ai-avatar-config";
import {
  MOTION_TRANSFER_CREDITS_MIN,
  MOTION_TRANSFER_ENGINE_ID,
} from "@/app/lib/motion/motion-transfer-config";
import {
  TRAIN_CREATOR_STYLE_CREDITS_MIN,
  TRAIN_CREATOR_STYLE_ENGINE_ID,
} from "@/app/lib/training/train-creator-style-config";
import {
  TRAIN_BRAND_KIT_CREDITS_MIN,
  TRAIN_BRAND_KIT_ENGINE_ID,
} from "@/app/lib/training/train-brand-kit-config";
import {
  TRAIN_PRODUCT_MODEL_CREDITS_MIN,
  TRAIN_PRODUCT_MODEL_ENGINE_ID,
} from "@/app/lib/training/train-product-model-config";
import {
  TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
  TRAIN_CREATOR_IDENTITY_ENGINE_ID,
} from "@/app/lib/training/train-creator-identity-config";
import {
  OBJECT_3D_CREDITS_MIN,
  OBJECT_3D_ENGINE_ID,
} from "@/app/lib/three-d/object-3d-config";
import {
  AUDIO_SOUND_DESIGN_CREDITS_MIN,
  AUDIO_SOUND_DESIGN_ENGINE_ID,
} from "@/app/lib/audio/audio-sound-design-config";
import type { AccessTier } from "@/app/lib/model-modes/types";
import type { ToolStatus } from "./tool-status";
import { isBlockedToolStatus } from "./tool-status";
import type { PublicToolStatus } from "./tool-status";
import { getModelExplanation } from "@/app/lib/copy/model-explanations";
import { STUDIO_CATEGORIES } from "@/app/lib/studio/studio-categories";

export type CreatorToolId =
  | ActionId
  | "social_asset_pack"
  | "hooks_captions"
  | "export_pack";

export type CreatorToolboxGroupId =
  | "create"
  | "edit"
  | "animate"
  | "train"
  | "optimize"
  | "advanced";

export type CreatorToolOutputType =
  | "image"
  | "video"
  | "audio"
  | "prompt"
  | "analysis"
  | "three_d"
  | "model"
  | "pack";

export type CreatorToolDefinition = {
  id: CreatorToolId;
  labelEn: string;
  labelDe: string;
  descriptionEn: string;
  descriptionDe: string;
  outputType: CreatorToolOutputType;
  /** Status when launch flags pass and provider path is validated. */
  statusWhenReady: ToolStatus;
  accessTier: AccessTier;
  /** When set, user must meet this tier before the tool can run. */
  planGate?: AccessTier;
  /** Links to action registry for status + routing metadata. */
  actionId?: ActionId;
  /** Primary launch engine used for validation + credit estimates. */
  primaryEngineId?: string;
  /** Fixed credit cost (internal / pack tools). */
  fixedCreditCost?: number;
  /** When true, paid provider generation may run when validated. */
  callsProvider: boolean;
  /** Allows planning / preview flows without provider calls. */
  allowsPreview?: boolean;
  /** Opens request-access panel while provider path is not validated. */
  allowsRequestAccess?: boolean;
  /** LAUNCH_CONFIG boolean gate (MVP features). */
  launchFeature?: keyof LaunchConfig;
  /** Experimental module gate (see launch-page-guard). */
  launchModule?: LaunchModuleKey;
  /** Hide entirely when launch gate is off (vs coming_soon). */
  hideWhenLaunchDisabled?: boolean;
  /** Training / beta tools open a request panel instead of coming soon. */
  audience?: "standard" | "training";
  href?: string;
  /** Creator Toolbox section */
  toolboxGroup: CreatorToolboxGroupId;
  /** Live tool that charges credits at generation time (status available + credits). */
  chargesCredits?: boolean;
  /** Primary model modes shown in the create UI. */
  modelModeIds?: readonly string[];
};

export const CREATOR_TOOLBOX_COPY = {
  title: { en: "Creator Toolbox", de: "Creator Toolbox" },
  subtitle: {
    en: "Every creator workflow in one studio — live tools run instantly, others unlock as they ship.",
    de: "Alle Creator-Workflows in einem Studio — Live-Tools starten sofort, weitere folgen schrittweise.",
  },
} as const;

export type CreatorToolboxGroupDefinition = {
  id: CreatorToolboxGroupId;
  labelEn: string;
  labelDe: string;
  /** One-line workflow hint shown under the category header. */
  descriptionEn: string;
  descriptionDe: string;
  toolIds: readonly CreatorToolId[];
};

/** Ordered toolbox sections — mirrors {@link STUDIO_CATEGORIES} for studio + toolbox UIs. */
export const CREATOR_TOOLBOX_GROUPS: readonly CreatorToolboxGroupDefinition[] =
  STUDIO_CATEGORIES.map((category) => ({
    id: category.id,
    labelEn: category.labelEn,
    labelDe: category.labelDe,
    descriptionEn: category.descriptionEn,
    descriptionDe: category.descriptionDe,
    toolIds: category.toolIds,
  }));

/** Toolbox-visible tool ids in display order (deduped). */
export const CREATOR_TOOLBOX_VISIBLE_TOOL_IDS: readonly CreatorToolId[] =
  CREATOR_TOOLBOX_GROUPS.flatMap((group) => group.toolIds);

/** Training workflows — uploads and train routes must stay blocked until live. */
export const CREATOR_TRAINING_TOOL_IDS = [
  "train_creator_style",
  "train_brand_kit",
  "train_product_model",
  "train_creator_identity",
] as const;

export const CREATOR_REFERENCE_UPLOAD_TOOL_IDS = [
  "use_reference_image",
  "edit_image",
  "match_style",
] as const;

/** Dashboard studio sidebar — Create lives in Primary Actions; other groups stay in toolbox. */
export const CREATOR_TOOLBOX_SECONDARY_GROUPS = CREATOR_TOOLBOX_GROUPS.filter(
  (group) => group.id !== "create"
);

export function isCreatorToolboxListedTool(toolId: CreatorToolId): boolean {
  return CREATOR_TOOLBOX_VISIBLE_TOOL_IDS.includes(toolId);
}

export function getCreatorToolboxGroupForTool(
  tool: CreatorToolDefinition
): CreatorToolboxGroupDefinition | null {
  return (
    CREATOR_TOOLBOX_GROUPS.find((group) => group.id === tool.toolboxGroup) ??
    null
  );
}

/** Create Image — registered available workflow with four quality modes. */
export const CREATE_IMAGE_MODE_IDS = [
  "auto_image",
  "fast_draft_image",
  "premium_image",
  "realtime_image",
] as const;

export type CreateImageModeId = (typeof CREATE_IMAGE_MODE_IDS)[number];

export const CREATE_IMAGE_TOOL = {
  id: "create_image" as const,
  labelEn: "Create Image",
  labelDe: "Bild erstellen",
  status: "available" as const,
  descriptionEn: "Generate creator visuals, product shots and social assets.",
  descriptionDe:
    "Erstelle Creator-Visuals, Produktshots und Social Assets.",
  modes: [
    {
      modelModeId: "auto_image" as const,
      labelEn: "Auto",
      labelDe: "Auto",
      expectedCredits: 1,
      resolveCreditsFromEngine: true,
    },
    {
      modelModeId: "fast_draft_image" as const,
      labelEn: "Fast Draft",
      labelDe: "Fast Draft",
      expectedCredits: 1,
      resolveCreditsFromEngine: true,
    },
    {
      modelModeId: "premium_image" as const,
      labelEn: "Premium Image",
      labelDe: "Premium Image",
      expectedCredits: 3,
      resolveCreditsFromEngine: true,
    },
    {
      modelModeId: "realtime_image" as const,
      labelEn: "Realtime Render",
      labelDe: "Realtime Render",
      expectedCredits: 1,
      resolveCreditsFromEngine: true,
    },
  ],
} as const;

export function isCreateImageModeId(value: string): value is CreateImageModeId {
  return (CREATE_IMAGE_MODE_IDS as readonly string[]).includes(value);
}

export function getCreateImageToolCopy(language: "en" | "de" = "en") {
  const isDe = language === "de";
  return {
    label: isDe ? CREATE_IMAGE_TOOL.labelDe : CREATE_IMAGE_TOOL.labelEn,
    description: isDe
      ? CREATE_IMAGE_TOOL.descriptionDe
      : CREATE_IMAGE_TOOL.descriptionEn,
    modes: CREATE_IMAGE_TOOL.modes.map((mode) => ({
      ...mode,
      label: isDe ? mode.labelDe : mode.labelEn,
    })),
  };
}

/** Create Motion Video — credit-gated workflow with two quality modes. */
export const CREATE_MOTION_VIDEO_MODE_IDS = [
  "auto_video",
  "cinematic_text_video",
] as const;

export type CreateMotionVideoModeId =
  (typeof CREATE_MOTION_VIDEO_MODE_IDS)[number];

export const CREATE_MOTION_VIDEO_CREDITS = 25;

export const CREATE_MOTION_VIDEO_TOOL = {
  id: "create_video" as const,
  labelEn: "Create Motion Video",
  labelDe: "Motion-Video erstellen",
  status: "credit_gated" as const,
  descriptionEn: "Turn an idea into a short AI-generated motion video.",
  descriptionDe:
    "Verwandle eine Idee in ein kurzes KI-generiertes Motion-Video.",
  creditCost: CREATE_MOTION_VIDEO_CREDITS,
  modes: [
    {
      modelModeId: "auto_video" as const,
      labelEn: "Auto Video",
      labelDe: "Auto Video",
      expectedCredits: CREATE_MOTION_VIDEO_CREDITS,
    },
    {
      modelModeId: "cinematic_text_video" as const,
      labelEn: "Cinematic Video",
      labelDe: "Cinematic Video",
      expectedCredits: CREATE_MOTION_VIDEO_CREDITS,
    },
  ],
} as const;

export function isCreateMotionVideoModeId(
  value: string
): value is CreateMotionVideoModeId {
  return (CREATE_MOTION_VIDEO_MODE_IDS as readonly string[]).includes(value);
}

export function getCreateMotionVideoToolCopy(language: "en" | "de" = "en") {
  const isDe = language === "de";
  return {
    label: isDe
      ? CREATE_MOTION_VIDEO_TOOL.labelDe
      : CREATE_MOTION_VIDEO_TOOL.labelEn,
    description: isDe
      ? CREATE_MOTION_VIDEO_TOOL.descriptionDe
      : CREATE_MOTION_VIDEO_TOOL.descriptionEn,
    creditCost: CREATE_MOTION_VIDEO_TOOL.creditCost,
    modes: CREATE_MOTION_VIDEO_TOOL.modes.map((mode) => ({
      ...mode,
      label: isDe ? mode.labelDe : mode.labelEn,
    })),
  };
}

/** Marketing + workflow copy for toolbox detail panels (non-runnable tools). */
export type CreatorToolDetailCopy = {
  benefitEn: string;
  benefitDe: string;
  willDoEn: string;
  willDoDe: string;
  estimatedCredits: number;
  /** Overrides numeric estimate in detail panel (e.g. "3–5 credits per render"). */
  creditsEstimateEn?: string;
  creditsEstimateDe?: string;
  /** Step-by-step workflow shown in the detail panel. */
  workflowStepsEn?: readonly string[];
  workflowStepsDe?: readonly string[];
  /** Short one-sentence “what it does” for the detail panel (falls back to description). */
  whatItDoesEn?: string;
  whatItDoesDe?: string;
  /** Example instruction shown in the detail panel. */
  examplePromptEn?: string;
  examplePromptDe?: string;
  /** Use-case bullets shown in the detail panel. */
  useCasesEn?: readonly string[];
  useCasesDe?: readonly string[];
};

export const CREATOR_TOOL_DETAILS: Partial<
  Record<CreatorToolId, CreatorToolDetailCopy>
> = {
  social_asset_pack: {
    benefitEn: "Create a complete social content package from one idea.",
    benefitDe: "Erstelle ein komplettes Social-Content-Paket aus einer Idee.",
    whatItDoesEn:
      "Plans images, a motion clip, hooks, captions, hashtags and export-ready formats from one prompt.",
    whatItDoesDe:
      "Plant Bilder, einen Motion-Clip, Hooks, Captions, Hashtags und export-fertige Formate aus einem Prompt.",
    willDoEn:
      "Preview your pack for free, then render when you are ready. Credits apply only when you run a paid render.",
    willDoDe:
      "Vorschau deines Packs kostenlos, Render wenn du bereit bist. Credits gelten nur beim bezahlten Render.",
    estimatedCredits: getSocialAssetPackTotalCredits(),
    creditsEstimateEn: "45 credits for full pack render",
    creditsEstimateDe: "45 Credits für vollständiges Pack-Render",
  },
  create_image: {
    benefitEn: "Generate creator visuals, product shots and social assets.",
    benefitDe: "Erstelle Creator-Visuals, Produktshots und Social Assets.",
    whatItDoesEn:
      "Turns your written idea into a still image in your chosen quality mode.",
    whatItDoesDe:
      "Verwandelt deine Idee in ein Standbild im gewählten Qualitätsmodus.",
    willDoEn:
      "Runs when the workflow is live — credits are shown before you generate and the result saves to your Gallery.",
    willDoDe:
      "Startet, wenn der Workflow live ist — Credits werden vor der Generierung angezeigt, das Ergebnis landet in der Gallery.",
    estimatedCredits: 1,
    creditsEstimateEn: "From 1 credit per render",
    creditsEstimateDe: "Ab 1 Credit pro Render",
  },
  create_video: {
    benefitEn: "Turn an idea into a short AI motion clip.",
    benefitDe: "Verwandle eine Idee in einen kurzen KI-Motion-Clip.",
    whatItDoesEn:
      "Generates a short motion video from your prompt in cinematic or auto mode.",
    whatItDoesDe:
      "Erstellt ein kurzes Motion-Video aus deinem Prompt im Cinematic- oder Auto-Modus.",
    willDoEn:
      "Charges credits before render when live. Your clip saves to the Gallery for export and reuse.",
    willDoDe:
      "Bucht Credits vor dem Render, wenn live. Dein Clip landet in der Gallery zum Export und zur Wiederverwendung.",
    estimatedCredits: CREATE_MOTION_VIDEO_CREDITS,
    creditsEstimateEn: "25 credits per render",
    creditsEstimateDe: "25 Credits pro Render",
  },
  use_reference_image: {
    benefitEn: "Guide a new asset with a reference image.",
    benefitDe: "Leite ein neues Asset mit einem Referenzbild.",
    whatItDoesEn:
      "Use a reference image to influence mood, composition or style.",
    whatItDoesDe:
      "Nutze ein Referenzbild, um Stimmung, Komposition oder Stil zu beeinflussen.",
    willDoEn:
      "Upload a reference image to influence mood, composition or style. Rendering unlocks once validated — no credits are charged while you preview this workflow.",
    willDoDe:
      "Lade ein Referenzbild hoch, um Stimmung, Komposition oder Stil zu beeinflussen. Rendering startet nach Validierung — in der Vorschau werden keine Credits abgebucht.",
    estimatedCredits: 5,
    creditsEstimateEn: "3–5 Credits",
    creditsEstimateDe: "3–5 Credits",
  },
  edit_image: {
    benefitEn: "Refine existing visuals without starting from scratch.",
    benefitDe: "Verfeinere bestehende Visuals, ohne bei null zu beginnen.",
    willDoEn:
      "When rendering unlocks, credits are charged before the edit runs and the result saves as a new Gallery asset. Your original image is never overwritten.",
    willDoDe:
      "Nach Freischaltung werden Credits vor dem Edit abgebucht und das Ergebnis als neues Gallery-Asset gespeichert. Dein Originalbild wird nie überschrieben.",
    estimatedCredits: 5,
    creditsEstimateEn: "5 credits per render",
    creditsEstimateDe: "5 Credits pro Render",
    workflowStepsEn: [
      "Upload or select an image from your device or Gallery",
      "Describe the style, background, lighting or composition change",
    ],
    workflowStepsDe: [
      "Lade ein Bild hoch oder wähle eines aus der Gallery",
      "Beschreibe Stil-, Hintergrund-, Licht- oder Kompositionsänderung",
    ],
  },
  match_style: {
    benefitEn: "Align new assets with your brand or creator look instantly.",
    benefitDe: "Passe neue Assets sofort an deinen Brand- oder Creator-Look an.",
    willDoEn:
      "When rendering unlocks, credits are charged before generation and the styled result saves as a new Gallery asset. No credits are consumed while previewing.",
    willDoDe:
      "Nach Freischaltung werden Credits vor der Generierung abgebucht und das Ergebnis als neues Gallery-Asset gespeichert. In der Vorschau werden keine Credits verbraucht.",
    estimatedCredits: 5,
    creditsEstimateEn: "5 credits per render",
    creditsEstimateDe: "5 Credits pro Render",
    workflowStepsEn: [
      "Upload or select a reference image that captures the look you want",
      "Describe what to create and how the reference should guide mood, color and style",
    ],
    workflowStepsDe: [
      "Lade ein Referenzbild hoch oder wähle eines, das den gewünschten Look zeigt",
      "Beschreibe, was entstehen soll und wie die Referenz Stimmung, Farbe und Stil leiten soll",
    ],
    examplePromptEn:
      "Use this reference to match the lighting, color mood and editorial style.",
    examplePromptDe:
      "Nutze diese Referenz für Lichtstimmung, Farbmood und editorialen Stil.",
  },
  enhance_asset: {
    benefitEn: "Rescue soft or noisy assets before paid social and final export.",
    benefitDe:
      "Rette unscharfe oder verrauschte Assets vor Paid Social und finalem Export.",
    willDoEn:
      "When rendering unlocks, select an image or video asset (based on supported formats), credits are charged before enhancement runs, and the improved version saves as a new Gallery asset. Your original is never overwritten. No credits are consumed while previewing.",
    willDoDe:
      "Nach Freischaltung wählst du ein Bild- oder Video-Asset (je nach Support), Credits werden vor der Verbesserung abgebucht und die Version landet als neues Gallery-Asset. Dein Original bleibt unverändert. In der Vorschau werden keine Credits verbraucht.",
    estimatedCredits: 3,
    creditsEstimateEn: "3 credits per render",
    creditsEstimateDe: "3 Credits pro Render",
    workflowStepsEn: [
      "Upload or select an image or video asset from your device or Gallery",
      "Run enhancement when the workflow unlocks — output saves separately",
    ],
    workflowStepsDe: [
      "Lade ein Bild- oder Video-Asset hoch oder wähle eines aus der Gallery",
      "Starte die Verbesserung nach Freischaltung — Ergebnis wird separat gespeichert",
    ],
    useCasesEn: [
      "Sharpen your visual",
      "Improve overall quality",
      "Clean compression artifacts",
      "Prepare for export and delivery",
    ],
    useCasesDe: [
      "Visual schärfen",
      "Gesamtqualität verbessern",
      "Kompressionsartefakte bereinigen",
      "Für Export und Auslieferung vorbereiten",
    ],
  },
  background_remove: {
    benefitEn: "Get clean cutouts for overlays, ads and product pages.",
    benefitDe: "Erhalte saubere Freisteller für Overlays, Ads und Produktseiten.",
    willDoEn:
      "When rendering unlocks, select an image asset, credits are charged before removal runs, and you receive a transparent or clean-background cutout saved as a new Gallery asset. Your original is never overwritten. No credits are consumed while previewing.",
    willDoDe:
      "Nach Freischaltung wählst du ein Bild, Credits werden vor dem Entfernen abgebucht und du erhältst einen Freisteller mit transparentem oder cleanem Hintergrund als neues Gallery-Asset. Dein Original bleibt unverändert. In der Vorschau werden keine Credits verbraucht.",
    estimatedCredits: 2,
    creditsEstimateEn: "2–3 credits per render",
    creditsEstimateDe: "2–3 Credits pro Render",
    workflowStepsEn: [
      "Upload or select a product or creator image from your device or Gallery",
      "Run background removal when the workflow unlocks — cutout saves separately",
    ],
    workflowStepsDe: [
      "Lade ein Produkt- oder Creator-Bild hoch oder wähle eines aus der Gallery",
      "Starte die Hintergrundentfernung nach Freischaltung — Freisteller wird separat gespeichert",
    ],
    useCasesEn: [
      "Product shots for e-commerce and ads",
      "Creator portraits for social overlays",
      "Clean assets for compositing and campaigns",
    ],
    useCasesDe: [
      "Produktshots für E-Commerce und Ads",
      "Creator-Portraits für Social-Overlays",
      "Saubere Assets für Compositing und Kampagnen",
    ],
  },
  upscale_image: {
    benefitEn: "Deliver sharper, higher-resolution assets for final export and paid placements.",
    benefitDe:
      "Liefere schärfere, hochauflösende Assets für finalen Export und Paid Placements.",
    willDoEn:
      "When rendering unlocks, select an image or video asset (based on supported formats), credits are charged before upscaling runs, and the higher-quality version saves as a new Gallery asset. Your original is never overwritten. No credits are consumed while previewing.",
    willDoDe:
      "Nach Freischaltung wählst du ein Bild- oder Video-Asset (je nach Support), Credits werden vor dem Upscale abgebucht und die Version landet als neues Gallery-Asset. Dein Original bleibt unverändert. In der Vorschau werden keine Credits verbraucht.",
    estimatedCredits: 3,
    creditsEstimateEn: "3 credits per render",
    creditsEstimateDe: "3 Credits pro Render",
    workflowStepsEn: [
      "Upload or select an image or video asset from your device or Gallery",
      "Run upscale when the workflow unlocks — output saves as a new version",
    ],
    workflowStepsDe: [
      "Lade ein Bild- oder Video-Asset hoch oder wähle eines aus der Gallery",
      "Starte das Upscale nach Freischaltung — Ergebnis wird als neue Version gespeichert",
    ],
    useCasesEn: [
      "Reels covers and ad hero frames",
      "Print-ready and high-DPI export",
      "Recover detail before campaign delivery",
    ],
    useCasesDe: [
      "Reels-Cover und Ad-Hero-Frames",
      "Druckfertiger und High-DPI-Export",
      "Details vor Kampagnen-Auslieferung wiederherstellen",
    ],
  },
  animate_image: {
    benefitEn: "Turn a still image into motion.",
    benefitDe: "Verwandle ein Standbild in Bewegung.",
    willDoEn:
      "Create a short motion clip from an existing image. Credits are charged only when rendering unlocks — no uploads or provider calls in preview mode.",
    willDoDe:
      "Erstelle einen kurzen Motion-Clip aus einem bestehenden Bild. Credits werden erst nach Freischaltung abgebucht — keine Uploads oder Provider-Calls im Vorschau-Modus.",
    estimatedCredits: ANIMATE_IMAGE_CREDITS,
    creditsEstimateEn: "25 credits per render",
    creditsEstimateDe: "25 Credits pro Render",
    workflowStepsEn: [
      "Select an image from Gallery or upload from your device",
      "Choose a motion style and export format (e.g. vertical for Reels)",
      "Render one motion clip when the workflow unlocks — no upload or render in request-access mode",
    ],
    workflowStepsDe: [
      "Wähle ein Bild aus der Gallery oder lade eines hoch",
      "Wähle Motion-Stil und Export-Format (z. B. vertikal für Reels)",
      "Rendere einen Motion-Clip nach Freischaltung — kein Upload oder Render im Request-Access-Modus",
    ],
    useCasesEn: [
      "Product hero loops for ads and landing pages",
      "Creator stills turned into Reels and Stories",
      "Campaign visuals with subtle cinematic motion",
    ],
    useCasesDe: [
      "Produkt-Hero-Loops für Ads und Landingpages",
      "Creator-Stills als Reels und Stories",
      "Kampagnen-Visuals mit subtiler cinematic Motion",
    ],
  },
  lipsync_creator: {
    benefitEn: "Ship talking-head content without a full video shoot.",
    benefitDe: "Veröffentliche Talking-Head-Content ohne komplettes Video-Shooting.",
    willDoEn:
      "When rendering unlocks, credits are charged before generation, lip-synced video saves to Gallery, and failed runs refund once. Request access to get notified — no uploads or provider calls until the workflow is cleared.",
    willDoDe:
      "Nach Freischaltung werden Credits vor der Generierung abgebucht, das lip-synced Video landet in der Gallery und fehlgeschlagene Runs werden einmal erstattet. Frage Zugang an — keine Uploads oder Provider-Calls bis zur Freigabe.",
    estimatedCredits: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
    creditsEstimateEn:
      "Upload audio: 30 credits · System voice: 35 credits",
    creditsEstimateDe:
      "Audio-Upload: 30 Credits · Systemstimme: 35 Credits",
    workflowStepsEn: [
      "Select or upload creator video footage (when rendering unlocks)",
      "Provide uploaded audio or a script for system voice",
      "Review credit cost for your chosen audio mode before rendering",
    ],
    workflowStepsDe: [
      "Wähle oder lade Creator-Video-Material (nach Freischaltung)",
      "Stelle hochgeladenes Audio oder ein Skript für die Systemstimme bereit",
      "Prüfe die Credit-Kosten für deinen Audio-Modus vor dem Rendern",
    ],
    useCasesEn: [
      "Talking-head ads and product explainers",
      "Creator updates without reshooting dialogue",
      "Localized voice tracks synced to existing footage",
    ],
    useCasesDe: [
      "Talking-Head-Ads und Produkt-Erklärvideos",
      "Creator-Updates ohne Dialog-Neudreh",
      "Lokalisierte Voice-Tracks synchron zu bestehendem Material",
    ],
  },
  ai_avatar: {
    benefitEn:
      "Produce presenter-style creator clips from a script without a full studio shoot.",
    benefitDe:
      "Erstelle Presenter-Style Creator-Clips aus einem Skript ohne komplettes Studio-Shooting.",
    willDoEn:
      "When rendering unlocks, write a script or prompt, confirm duration limits, and credits are charged before generation. The avatar-style video saves to Gallery; failed runs refund once. No generation, uploads or credits in request-access mode.",
    willDoDe:
      "Nach Freischaltung schreibst du Skript oder Prompt, bestätigst Dauer-Limits und Credits werden vor der Generierung abgebucht. Das Avatar-Style-Video landet in der Gallery; fehlgeschlagene Runs werden einmal erstattet. Keine Generierung, Uploads oder Credits im Request-Access-Modus.",
    estimatedCredits: AI_AVATAR_CREDITS_MIN,
    creditsEstimateEn: "40–50 credits per render",
    creditsEstimateDe: "40–50 Credits pro Render",
    workflowStepsEn: [
      "Write a script or prompt describing your avatar-style presenter message",
      "Choose duration and format when the workflow unlocks",
      "Review credit cost before rendering — for original creator content only",
    ],
    workflowStepsDe: [
      "Schreibe ein Skript oder einen Prompt für deine Avatar-Style-Presenter-Botschaft",
      "Wähle Dauer und Format nach Freischaltung",
      "Prüfe Credit-Kosten vor dem Rendern — nur für originäre Creator-Inhalte",
    ],
    useCasesEn: [
      "Product explainers and onboarding walkthroughs",
      "Campaign updates from a consistent presenter look",
      "Short-form educational clips for social channels",
    ],
    useCasesDe: [
      "Produkt-Erklärvideos und Onboarding-Walkthroughs",
      "Kampagnen-Updates mit konsistentem Presenter-Look",
      "Kurze Educational-Clips für Social Kanäle",
    ],
  },
  motion_transfer: {
    benefitEn:
      "Apply expressive motion from a reference clip to your creator subject.",
    benefitDe:
      "Übertrage ausdrucksstarke Bewegung aus einem Referenzclip auf dein Creator-Motiv.",
    willDoEn:
      "When rendering unlocks, pair a source image or video with a motion preset or reference clip, credits are charged before generation, and the output video saves to Gallery. Failed runs refund once. No uploads, provider calls or credits in request-access mode.",
    willDoDe:
      "Nach Freischaltung kombinierst du Quellbild oder -video mit Motion-Preset oder Referenzclip, Credits werden vor der Generierung abgebucht und das Video landet in der Gallery. Fehlgeschlagene Runs werden einmal erstattet. Keine Uploads, Provider-Calls oder Credits im Request-Access-Modus.",
    estimatedCredits: MOTION_TRANSFER_CREDITS_MIN,
    creditsEstimateEn: "30–50 credits per render",
    creditsEstimateDe: "30–50 Credits pro Render",
    workflowStepsEn: [
      "Select a source creator image or video (when rendering unlocks)",
      "Choose a motion preset or upload a reference movement clip",
      "Review credit cost before rendering — output saves separately to Gallery",
    ],
    workflowStepsDe: [
      "Wähle ein Quell-Creator-Bild oder -Video (nach Freischaltung)",
      "Wähle ein Motion-Preset oder lade einen Referenz-Bewegungsclip hoch",
      "Prüfe Credit-Kosten vor dem Rendern — Ergebnis wird separat in der Gallery gespeichert",
    ],
    useCasesEn: [
      "Apply dance or gesture energy to product hero shots",
      "Match trending motion styles for social clips",
      "Transfer head pose and expression from reference footage",
    ],
    useCasesDe: [
      "Tanz- oder Gesten-Energie auf Produkt-Hero-Shots übertragen",
      "Trending Motion-Stile für Social-Clips übernehmen",
      "Kopfhaltung und Mimik aus Referenz-Material übertragen",
    ],
  },
  train_creator_style: {
    benefitEn:
      "Build a reusable creator look you can apply across future image generations.",
    benefitDe:
      "Baue einen wiederverwendbaren Creator-Look für künftige Bildgenerierungen.",
    willDoEn:
      "When training unlocks, curate a dataset from your approved creator assets, review credit cost, and train a private style profile for consistent future outputs. No dataset upload, training jobs, provider calls or credits until the workflow is cleared.",
    willDoDe:
      "Nach Freischaltung kuratierst du ein Dataset aus freigegebenen Creator-Assets, prüfst Credit-Kosten und trainierst ein privates Stil-Profil für konsistente Ergebnisse. Kein Dataset-Upload, keine Trainingsjobs, Provider-Calls oder Credits bis zur Freigabe.",
    estimatedCredits: TRAIN_CREATOR_STYLE_CREDITS_MIN,
    creditsEstimateEn: "100–300 credits per training run",
    creditsEstimateDe: "100–300 Credits pro Training",
    workflowStepsEn: [
      "Curate 10–50 high-quality images that represent your creator aesthetic",
      "Submit the dataset when training infrastructure unlocks (Pro workflow)",
      "Apply your trained creator look to future image generations",
    ],
    workflowStepsDe: [
      "Kuratiere 10–50 hochwertige Bilder, die deine Creator-Ästhetik zeigen",
      "Reiche das Dataset ein, wenn die Training-Infrastruktur freigeschaltet ist (Pro-Workflow)",
      "Wende deinen trainierten Creator-Look auf künftige Bildgenerierungen an",
    ],
    useCasesEn: [
      "Consistent color grading and mood across campaigns",
      "Recognizable creator aesthetic at scale",
      "Reusable look for product and lifestyle content",
    ],
    useCasesDe: [
      "Konsistente Farbgebung und Stimmung über Kampagnen hinweg",
      "Wiedererkennbarer Creator-Look in großem Umfang",
      "Wiederverwendbarer Look für Produkt- und Lifestyle-Content",
    ],
  },
  train_brand_kit: {
    benefitEn: "Keep brand assets visually consistent.",
    benefitDe: "Halte Brand-Assets visuell konsistent.",
    willDoEn:
      "Train a reusable brand visual system from logos, colors and product shots. No uploads, training jobs or credits until the workflow is cleared.",
    willDoDe:
      "Trainiere ein wiederverwendbares Marken-Visual-System aus Logos, Farben und Produktshots. Keine Uploads, Trainingsjobs oder Credits bis zur Freischaltung.",
    estimatedCredits: TRAIN_BRAND_KIT_CREDITS_MIN,
    creditsEstimateEn: "150–300 credits per training run",
    creditsEstimateDe: "150–300 Credits pro Training",
    workflowStepsEn: [
      "Gather logos, brand colors, product shots and on-brand example assets",
      "Submit the brand dataset when training infrastructure unlocks (Pro workflow)",
      "Generate new assets that stay consistent with your trained brand system",
    ],
    workflowStepsDe: [
      "Sammle Logos, Markenfarben, Produktshots und on-brand Beispiel-Assets",
      "Reiche das Brand-Dataset ein, wenn die Training-Infrastruktur freigeschaltet ist (Pro-Workflow)",
      "Generiere neue Assets, die zu deinem trainierten Marken-System passen",
    ],
    useCasesEn: [
      "On-brand product launches across social and paid channels",
      "Consistent team output without manual style policing",
      "Scalable brand visuals for e-commerce and campaigns",
    ],
    useCasesDe: [
      "On-brand Produkt-Launches über Social und Paid Kanäle",
      "Konsistente Team-Outputs ohne manuelles Style-Policing",
      "Skalierbare Brand-Visuals für E-Commerce und Kampagnen",
    ],
  },
  train_product_model: {
    benefitEn:
      "Render consistent product visuals across angles, scenes and campaigns without reshooting every SKU.",
    benefitDe:
      "Rendere konsistente Produktvisuals über Winkel, Szenen und Kampagnen — ohne jedes SKU neu zu shooten.",
    willDoEn:
      "When training unlocks, curate an approved product image set (packshots, angles, detail shots), review credit cost, and train a reusable product model for consistent future visuals. No uploads, training jobs, provider calls or credits until the workflow is cleared.",
    willDoDe:
      "Nach Freischaltung kuratierst du ein freigegebenes Produkt-Bildset (Packshots, Winkel, Detailshots), prüfst Credit-Kosten und trainierst ein wiederverwendbares Produktmodell für konsistente künftige Visuals. Keine Uploads, Trainingsjobs, Provider-Calls oder Credits bis zur Freigabe.",
    estimatedCredits: TRAIN_PRODUCT_MODEL_CREDITS_MIN,
    creditsEstimateEn: "150–300 credits per training run",
    creditsEstimateDe: "150–300 Credits pro Training",
    workflowStepsEn: [
      "Assemble an approved product image set with clear angles and lighting",
      "Submit the dataset when training infrastructure unlocks (Pro workflow)",
      "Generate new product scenes that stay visually consistent with your trained model",
    ],
    workflowStepsDe: [
      "Stelle ein freigegebenes Produkt-Bildset mit klaren Winkeln und Licht zusammen",
      "Reiche das Dataset ein, wenn die Training-Infrastruktur freigeschaltet ist (Pro-Workflow)",
      "Generiere neue Produktszenen, die visuell zu deinem trainierten Modell passen",
    ],
    useCasesEn: [
      "E-commerce hero shots and lifestyle scenes from one product set",
      "Seasonal campaigns with the same product look every time",
      "Multi-SKU catalogs without studio reshoots",
    ],
    useCasesDe: [
      "E-Commerce-Hero-Shots und Lifestyle-Szenen aus einem Produktset",
      "Saisonale Kampagnen mit dem gleichen Produktlook jedes Mal",
      "Multi-SKU-Kataloge ohne Studio-Neuaufnahmen",
    ],
  },
  train_creator_identity: {
    benefitEn:
      "Stay visually recognizable across posts, ads and campaigns while you scale output.",
    benefitDe:
      "Bleibe visuell wiedererkennbar über Posts, Ads und Kampagnen — auch wenn du Output skalierst.",
    willDoEn:
      "When training unlocks, submit an approved image set you own or have rights to use — your own likeness, styling and framing only. Review credit cost, then train a reusable creator identity for consistent future visuals. No uploads, training jobs, provider calls or credits until the workflow is cleared. Public figures, celebrities and third-party likenesses are not supported.",
    willDoDe:
      "Nach Freischaltung reichst du ein freigegebenes Bildset ein, das dir gehört oder das du nutzen darfst — nur dein eigenes Erscheinungsbild, Styling und Framing. Prüfe Credit-Kosten und trainiere eine wiederverwendbare Creator-Identity für konsistente künftige Visuals. Keine Uploads, Trainingsjobs, Provider-Calls oder Credits bis zur Freigabe. Öffentliche Personen, Prominente und fremde Likenesses werden nicht unterstützt.",
    estimatedCredits: TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
    creditsEstimateEn: "150–300 credits per training run",
    creditsEstimateDe: "150–300 Credits pro Training",
    workflowStepsEn: [
      "Curate an approved image set with consistent lighting, angles and styling you have rights to use",
      "Confirm the set is your own creator identity — not public figures or third-party likenesses",
      "Submit when training infrastructure unlocks (Pro workflow) and generate consistent creator-style assets",
    ],
    workflowStepsDe: [
      "Kuratiere ein freigegebenes Bildset mit konsistentem Licht, Winkeln und Styling, das du nutzen darfst",
      "Bestätige, dass es deine eigene Creator-Identity ist — keine öffentlichen Personen oder fremde Likenesses",
      "Reiche ein, wenn die Training-Infrastruktur freigeschaltet ist (Pro-Workflow), und generiere konsistente Creator-Visuals",
    ],
    useCasesEn: [
      "Consistent on-camera presence across a content calendar",
      "Recognizable creator framing in thumbnails and short-form clips",
      "Scaled personal-brand visuals without reshooting every asset",
    ],
    useCasesDe: [
      "Konsistente On-Camera-Präsenz über einen Content-Kalender",
      "Wiedererkennbares Creator-Framing in Thumbnails und Short-Form-Clips",
      "Skalierte Personal-Brand-Visuals ohne jedes Asset neu zu shooten",
    ],
  },
  hooks_captions: {
    benefitEn:
      "Plan scroll-stopping copy before you spend credits on image or video renders.",
    benefitDe:
      "Plane scroll-stoppenden Copy-Text, bevor du Credits für Bild- oder Video-Renders ausgibst.",
    willDoEn:
      "Generate 5 hooks, 3 captions, hashtags and optional TikTok, Reels, Story and Feed variants from your asset idea — free, with no image or video provider calls.",
    willDoDe:
      "Generiere 5 Hooks, 3 Captions, Hashtags und optionale TikTok-, Reels-, Story- und Feed-Varianten aus deiner Asset-Idee — kostenlos, ohne Bild- oder Video-Provider-Calls.",
    estimatedCredits: 0,
    creditsEstimateEn: "Free for MVP",
    creditsEstimateDe: "Kostenlos im MVP",
    workflowStepsEn: [
      "Describe your asset, product or campaign idea in the prompt",
      "Generate hooks, captions, hashtags and platform-specific variants",
      "Copy any section to use in your video workflow or Social Asset Pack",
    ],
    workflowStepsDe: [
      "Beschreibe dein Asset, Produkt oder Kampagnen-Idee im Prompt",
      "Generiere Hooks, Captions, Hashtags und plattformspezifische Varianten",
      "Kopiere beliebige Abschnitte für deinen Video-Workflow oder Social Asset Pack",
    ],
    useCasesEn: [
      "Caption drafts before LipSync or motion clip renders",
      "Hashtag sets for product launch posts",
      "Platform-specific hook tests for TikTok vs Feed",
    ],
    useCasesDe: [
      "Caption-Entwürfe vor LipSync- oder Motion-Clip-Renders",
      "Hashtag-Sets für Produkt-Launch-Posts",
      "Plattformspezifische Hook-Tests für TikTok vs Feed",
    ],
  },
  check_creative_score: {
    benefitEn:
      "Get practical feedback on hook clarity, contrast, subject focus and social readiness before you spend more credits.",
    benefitDe:
      "Erhalte praxisnahes Feedback zu Hook-Klarheit, Kontrast, Motivfokus und Social-Tauglichkeit, bevor du weitere Credits ausgibst.",
    willDoEn:
      "Score your asset across eight dimensions, copy suggested hooks and captions, then improve with a validated image variant (credits shown upfront) or an improved prompt preview only.",
    willDoDe:
      "Bewerte dein Asset über acht Dimensionen, kopiere Hook- und Caption-Vorschläge und verbessere mit einer validierten Bild-Variante (Credits vorab sichtbar) oder nur einer Prompt-Vorschau.",
    estimatedCredits: 0,
    creditsEstimateEn: "Free score · variant credits shown before render",
    creditsEstimateDe: "Kostenloser Score · Varianten-Credits vor dem Render sichtbar",
    workflowStepsEn: [
      "Open Creative Score from Gallery or after a generation",
      "Review dimensions: hook, contrast, focus, formats, mobile, ads, thumbnail, captions",
      "Tap Improve this asset — variant render shows credit cost, or get prompt preview only",
    ],
    workflowStepsDe: [
      "Öffne Creative Score aus der Gallery oder nach einer Generierung",
      "Prüfe Dimensionen: Hook, Kontrast, Fokus, Formate, Mobile, Ads, Thumbnail, Captions",
      "Tippe Asset verbessern — Varianten-Render zeigt Credit-Kosten, oder nur Prompt-Vorschau",
    ],
    useCasesEn: [
      "Sanity-check assets before paid social campaigns",
      "Turn score feedback into a stronger variant prompt",
      "Share hook and caption ideas with your team",
    ],
    useCasesDe: [
      "Assets vor bezahlten Social-Kampagnen prüfen",
      "Score-Feedback in einen stärkeren Varianten-Prompt übersetzen",
      "Hook- und Caption-Ideen im Team teilen",
    ],
  },
  export_pack: {
    benefitEn:
      "Ship creator-ready exports for every major social format without paying twice for assets you already generated.",
    benefitDe:
      "Liefere creator-ready Exports für alle wichtigen Social-Formate — ohne Assets doppelt zu bezahlen.",
    willDoEn:
      "Prepare TikTok, Reels, Story and Feed format suggestions, captions, hashtags and a download bundle from your selected Gallery assets. Basic export is free. HD upscale is optional and shows its credit cost before any paid render runs.",
    willDoDe:
      "Bereite TikTok-, Reels-, Story- und Feed-Format-Vorschläge, Captions, Hashtags und ein Download-Bundle aus deinen ausgewählten Gallery-Assets vor. Basis-Export ist kostenlos. HD-Upscale ist optional und zeigt Credit-Kosten vor jedem bezahlten Render.",
    estimatedCredits: 0,
    creditsEstimateEn: "Free export · HD upscale separate",
    creditsEstimateDe: "Kostenloser Export · HD-Upscale separat",
    workflowStepsEn: [
      "Select completed assets from your Gallery",
      "Review format suggestions for TikTok, Reels, Story and Feed",
      "Download assets and copy captions or hashtags — no extra credits for basic export",
    ],
    workflowStepsDe: [
      "Wähle fertige Assets aus deiner Gallery",
      "Prüfe Format-Vorschläge für TikTok, Reels, Story und Feed",
      "Lade Assets herunter und kopiere Captions oder Hashtags — kein Extra-Credit für Basis-Export",
    ],
    useCasesEn: [
      "Multi-platform posting from one generated hero visual",
      "Client-ready export package with captions included",
      "Free re-download of assets you already paid to generate",
    ],
    useCasesDe: [
      "Multi-Platform-Posting aus einem generierten Hero-Visual",
      "Client-ready Export-Paket inklusive Captions",
      "Kostenloser Re-Download bereits bezahlter Assets",
    ],
  },
  object_3d: {
    benefitEn:
      "Turn product descriptions or reference shots into premium 3D-style campaign assets.",
    benefitDe:
      "Verwandle Produktbeschreibungen oder Referenzshots in premium 3D-Style-Kampagnen-Assets.",
    willDoEn:
      "When rendering unlocks, describe your product or provide a reference image, review credit cost, and generate a 3D-style asset saved to your Gallery or asset library. Credits are charged before the provider call. No uploads, provider calls or credits in request-access mode.",
    willDoDe:
      "Nach Freischaltung beschreibst du dein Produkt oder lieferst ein Referenzbild, prüfst Credit-Kosten und generierst ein 3D-Style-Asset, das in Gallery oder Asset-Bibliothek gespeichert wird. Credits werden vor dem Provider-Call abgebucht. Keine Uploads, Provider-Calls oder Credits im Request-Access-Modus.",
    estimatedCredits: OBJECT_3D_CREDITS_MIN,
    creditsEstimateEn: "30–60 credits per render",
    creditsEstimateDe: "30–60 Credits pro Render",
    workflowStepsEn: [
      "Write a prompt describing your product or select a reference image from Gallery",
      "Review estimated credit cost before rendering when the workflow unlocks",
      "Export 3D-style assets for ads, landing pages, e-commerce and social — output saves to Gallery",
    ],
    workflowStepsDe: [
      "Schreibe einen Prompt für dein Produkt oder wähle ein Referenzbild aus der Gallery",
      "Prüfe geschätzte Credit-Kosten vor dem Rendern, wenn der Workflow freigeschaltet ist",
      "Exportiere 3D-Style-Assets für Ads, Landingpages, E-Commerce und Social — Ergebnis landet in der Gallery",
    ],
    useCasesEn: [
      "Product hero visuals for landing pages and paid social",
      "E-commerce packshots with depth and lighting variety",
      "Campaign mockups before committing to a full 3D pipeline",
    ],
    useCasesDe: [
      "Produkt-Hero-Visuals für Landingpages und Paid Social",
      "E-Commerce-Packshots mit Tiefen- und Lichtvarianten",
      "Kampagnen-Mockups vor einer vollen 3D-Pipeline",
    ],
  },
  audio_sound_design: {
    benefitEn:
      "Pair motion and talking-head clips with sound effects and background audio that match your creator vibe.",
    benefitDe:
      "Kombiniere Motion- und Talking-Head-Clips mit Sound-Effekten und Hintergrund-Audio, das zu deinem Creator-Vibe passt.",
    willDoEn:
      "When rendering unlocks, describe the mood or scene for your clip and generate sound effects or background audio saved to your asset library. Credits are charged before rendering — no audio generation, provider calls or credits in request-access mode.",
    willDoDe:
      "Nach Freischaltung beschreibst du Stimmung oder Szene für deinen Clip und generierst Sound-Effekte oder Hintergrund-Audio für deine Asset-Bibliothek. Credits werden vor dem Rendern abgebucht — keine Audio-Generierung, Provider-Calls oder Credits im Request-Access-Modus.",
    estimatedCredits: AUDIO_SOUND_DESIGN_CREDITS_MIN,
    creditsEstimateEn: "5–15 credits per render",
    creditsEstimateDe: "5–15 Credits pro Render",
    workflowStepsEn: [
      "Describe the mood, pacing or scene for your creator video clip",
      "Choose sound direction — effects, ambient bed or short background loop when rendering unlocks",
      "Review credit cost before generation — audio saves to Gallery for use in LipSync and motion workflows",
    ],
    workflowStepsDe: [
      "Beschreibe Stimmung, Pacing oder Szene für deinen Creator-Video-Clip",
      "Wähle Sound-Richtung — Effekte, Ambient-Bed oder kurzer Background-Loop nach Freischaltung",
      "Prüfe Credit-Kosten vor der Generierung — Audio landet in der Gallery für LipSync- und Motion-Workflows",
    ],
    useCasesEn: [
      "Background beds for short-form product and lifestyle clips",
      "Transition and emphasis sound effects for Reels and TikTok",
      "Audio mood boards before committing to full video renders",
    ],
    useCasesDe: [
      "Hintergrund-Beds für Short-Form Produkt- und Lifestyle-Clips",
      "Transition- und Akzent-Sound-Effekte für Reels und TikTok",
      "Audio-Mood-Boards vor vollen Video-Renders",
    ],
  },
};

export const TOOL_DETAIL_PANEL_COPY = {
  benefitLabel: { en: "Benefit", de: "Vorteil" },
  whatItDoesLabel: { en: "What it does", de: "Was es tut" },
  willDoLabel: { en: "What it will do", de: "Was es tun wird" },
  requirementsLabel: { en: "Requirements", de: "Voraussetzungen" },
  statusLabel: { en: "Status", de: "Status" },
  workflowLabel: { en: "Workflow", de: "Workflow" },
  exampleLabel: { en: "Example instruction", de: "Beispiel-Anweisung" },
  useCasesLabel: { en: "Use cases", de: "Anwendungsfälle" },
  creditsLabel: { en: "Estimated credits", de: "Geschätzte Credits" },
  creditsEstimatedPrefix: { en: "Estimated", de: "Geschätzt" },
  creditsFree: { en: "Free to preview", de: "Kostenlose Vorschau" },
  creditsFrom: { en: "from", de: "ab" },
  backToToolbox: { en: "Back to toolbox", de: "Zurück zur Toolbox" },
  back: { en: "Back", de: "Zurück" },
  previewWorkflow: { en: "Preview workflow", de: "Workflow ansehen" },
  requestAccess: { en: "Request access", de: "Zugang anfragen" },
  notifyMe: { en: "Notify me", de: "Benachrichtigen" },
  viewUpgrade: { en: "View upgrade options", de: "Upgrade-Optionen ansehen" },
  statusReasonLabel: { en: "Why it is not live yet", de: "Warum es noch nicht live ist" },
  noGenerationNote: {
    en: "This panel is informational only — no credits are charged and no generation runs until this tool is live.",
    de: "Dieses Panel ist nur informativ — es werden keine Credits abgebucht und keine Generierung gestartet, bis das Tool live ist.",
  },
} as const;

export {
  FRIENDLY_TOOL_UNAVAILABLE_COPY,
  getFriendlyToolUnavailableReason,
  getInternalToolBlockerForLogs,
  looksLikeInternalBlockerText,
} from "./tool-status";

export type ToolDetailPanelPrimaryCta =
  | "request_access"
  | "notify_me"
  | "preview_workflow";

/** Resolves the primary CTA for non-live tool detail panels. */
export function resolveToolDetailPanelPrimaryCta(input: {
  publicStatus: PublicToolStatus;
  audience?: CreatorToolDefinition["audience"];
  localInterestBackendAvailable?: boolean;
}): ToolDetailPanelPrimaryCta | null {
  const { publicStatus, audience, localInterestBackendAvailable = true } = input;

  if (publicStatus === "live" || publicStatus === "disabled") return null;

  if (publicStatus === "preview") return "preview_workflow";

  if (publicStatus === "request_access" || audience === "training") {
    return "request_access";
  }

  if (publicStatus === "coming_soon") {
    return localInterestBackendAvailable ? "notify_me" : "request_access";
  }

  if (publicStatus === "blocked") {
    return "request_access";
  }

  if (publicStatus === "pro_locked") return null;

  return null;
}

export function getToolDetailPanelPrimaryCtaLabel(
  cta: ToolDetailPanelPrimaryCta,
  language: "en" | "de" = "en"
): string {
  const isDe = language === "de";
  const copy = TOOL_DETAIL_PANEL_COPY;
  switch (cta) {
    case "preview_workflow":
      return isDe ? copy.previewWorkflow.de : copy.previewWorkflow.en;
    case "request_access":
      return isDe ? copy.requestAccess.de : copy.requestAccess.en;
    case "notify_me":
      return isDe ? copy.notifyMe.de : copy.notifyMe.en;
  }
}

export function isToolDetailPanelStatus(status: ToolStatus): boolean {
  if (isBlockedToolStatus(status)) return true;
  return (
    status === "preview" ||
    status === "request_access" ||
    status === "coming_soon" ||
    status === "pro_locked"
  );
}

export function getCreatorToolDetailCopy(
  toolId: CreatorToolId,
  language: "en" | "de" = "en"
): CreatorToolDetailCopy | null {
  const detail = CREATOR_TOOL_DETAILS[toolId];
  if (!detail) return null;
  return detail;
}

export function getCreatorToolDetailForPanel(
  tool: CreatorToolDefinition,
  language: "en" | "de" = "en"
): {
  benefit: string;
  whatItDoes: string;
  willDo: string;
  estimatedCredits: number;
  creditsEstimateLabel?: string;
  workflowSteps?: string[];
  examplePrompt?: string;
  useCases?: string[];
} {
  const detail = CREATOR_TOOL_DETAILS[tool.id];
  const estimatedCredits =
    detail?.estimatedCredits ??
    (() => {
      const cost = resolveCreatorToolCreditCost(tool);
      return cost > 0 ? cost : 0;
    })();

  if (detail) {
    const whatItDoes =
      language === "de"
        ? detail.whatItDoesDe ?? detail.willDoDe
        : detail.whatItDoesEn ?? detail.willDoEn;
    const lang = language === "de" ? "de" : "en";
    const curatedBenefit = getModelExplanation(tool.id, lang);
    return {
      benefit:
        curatedBenefit ??
        (language === "de" ? detail.benefitDe : detail.benefitEn),
      whatItDoes,
      willDo: language === "de" ? detail.willDoDe : detail.willDoEn,
      estimatedCredits,
      creditsEstimateLabel:
        language === "de"
          ? detail.creditsEstimateDe
          : detail.creditsEstimateEn,
      workflowSteps:
        language === "de"
          ? detail.workflowStepsDe
            ? [...detail.workflowStepsDe]
            : undefined
          : detail.workflowStepsEn
            ? [...detail.workflowStepsEn]
            : undefined,
      examplePrompt:
        language === "de" ? detail.examplePromptDe : detail.examplePromptEn,
      useCases:
        language === "de"
          ? detail.useCasesDe
            ? [...detail.useCasesDe]
            : undefined
          : detail.useCasesEn
            ? [...detail.useCasesEn]
            : undefined,
    };
  }

  const lang = language === "de" ? "de" : "en";
  const description =
    getModelExplanation(tool.id, lang) ??
    (language === "de" ? tool.descriptionDe : tool.descriptionEn);
  return {
    benefit: description,
    whatItDoes: description,
    willDo:
      language === "de"
        ? "Dieser Workflow wird im Creator Studio verfügbar sein."
        : "This workflow will be available in the Creator Studio.",
    estimatedCredits,
  };
}

export const CREATOR_TOOL_ALIASES: Record<string, CreatorToolId> = {
  pack: "social_asset_pack",
  "social-asset-pack": "social_asset_pack",
  image: "create_image",
  video: "create_video",
  "create-image": "create_image",
  "create-video": "create_video",
  creative_score: "check_creative_score",
  prompt_assist: "improve_prompt",
  style_variant: "create_style_variant",
  hooks_captions: "hooks_captions",
  export_pack: "export_pack",
};

/** Mirrors docs/MODEL_ACTIVATION_STATUS.md — update both when launch matrix changes. */
export const CREATOR_TOOL_ACTIVATION_DOC = "docs/MODEL_ACTIVATION_STATUS.md" as const;

export const CREATOR_TOOL_REGISTRY: readonly CreatorToolDefinition[] = [
  {
    id: "create_image",
    labelEn: "Create Image",
    labelDe: "Bild erstellen",
    descriptionEn:
      "Generate creator visuals, product shots and social assets.",
    descriptionDe:
      "Erstelle Creator-Visuals, Produktshots und Social Assets.",
    outputType: "image",
    statusWhenReady: "live",
    chargesCredits: true,
    accessTier: "free",
    actionId: "create_image",
    primaryEngineId: "smart_auto_pilot",
    modelModeIds: CREATE_IMAGE_MODE_IDS,
    callsProvider: true,
    launchFeature: "enableImageGeneration",
    href: "/dashboard/image",
    toolboxGroup: "create",
  },
  {
    id: "create_video",
    labelEn: "Create Motion Video",
    labelDe: "Motion-Video erstellen",
    descriptionEn: "Turn an idea into a short AI-generated motion video.",
    descriptionDe:
      "Verwandle eine Idee in ein kurzes KI-generiertes Motion-Video.",
    outputType: "video",
    statusWhenReady: "live",
    chargesCredits: true,
    fixedCreditCost: CREATE_MOTION_VIDEO_CREDITS,
    accessTier: "creator",
    actionId: "create_video",
    primaryEngineId: "fal_kling_v3_t2v",
    modelModeIds: CREATE_MOTION_VIDEO_MODE_IDS,
    callsProvider: true,
    launchFeature: "enableTextToVideo",
    href: "/dashboard/video",
    toolboxGroup: "create",
  },
  {
    id: "social_asset_pack",
    labelEn: "Social Asset Pack",
    labelDe: "Social Asset Pack",
    descriptionEn:
      "Turn one idea into images, a motion clip, hooks, captions, hashtags and export-ready formats.",
    descriptionDe:
      "Verwandle eine Idee in Bilder, einen Motion-Clip, Hooks, Captions, Hashtags und export-fertige Formate.",
    outputType: "pack",
    statusWhenReady: "live",
    chargesCredits: true,
    fixedCreditCost: getSocialAssetPackTotalCredits(),
    accessTier: "creator",
    callsProvider: true,
    allowsPreview: true,
    launchFeature: "enableSocialAssetPack",
    href: "/dashboard",
    toolboxGroup: "create",
  },
  {
    id: "create_style_variant",
    labelEn: "Style Variant",
    labelDe: "Stil-Variante",
    descriptionEn: "Fast draft variant of an existing creator visual.",
    descriptionDe: "Schnelle Stil-Variante eines bestehenden Creator-Visuals.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "free",
    actionId: "create_style_variant",
    primaryEngineId: "krea_flux_fast_draft",
    callsProvider: true,
    launchFeature: "enableImageGeneration",
    toolboxGroup: "create",
  },
  {
    id: "improve_prompt",
    labelEn: "Improve Prompt",
    labelDe: "Prompt verbessern",
    descriptionEn: "Improve your idea as you type.",
    descriptionDe: "Verbessere deine Idee beim Tippen.",
    outputType: "prompt",
    statusWhenReady: "available",
    accessTier: "free",
    actionId: "improve_prompt",
    fixedCreditCost: 0,
    callsProvider: false,
    launchFeature: "enablePromptAssist",
    toolboxGroup: "optimize",
  },
  {
    id: "check_creative_score",
    labelEn: "Creative Score",
    labelDe: "Creative Score",
    descriptionEn:
      "Get feedback on clarity, composition, hooks and social readiness.",
    descriptionDe:
      "Erhalte Feedback zu Klarheit, Komposition, Hooks und Social-Tauglichkeit.",
    outputType: "analysis",
    statusWhenReady: "live",
    accessTier: "free",
    actionId: "check_creative_score",
    fixedCreditCost: 0,
    callsProvider: false,
    launchFeature: "enableCreativeScore",
    href: "/dashboard/gallery",
    toolboxGroup: "optimize",
  },
  {
    id: "hooks_captions",
    labelEn: "Hooks & Captions",
    labelDe: "Hooks & Captions",
    descriptionEn: "Generate hooks, captions and hashtags for your asset.",
    descriptionDe:
      "Generiere Hooks, Captions und Hashtags für dein Asset.",
    outputType: "prompt",
    statusWhenReady: "live",
    accessTier: "free",
    fixedCreditCost: 0,
    callsProvider: false,
    launchFeature: "enableHooksCaptions",
    toolboxGroup: "optimize",
  },
  {
    id: "export_pack",
    labelEn: "Export Pack",
    labelDe: "Export-Paket",
    descriptionEn:
      "Prepare creator-ready formats for TikTok, Reels, Story and Feed.",
    descriptionDe:
      "Bereite creator-ready Formate für TikTok, Reels, Story und Feed vor.",
    outputType: "pack",
    statusWhenReady: "live",
    accessTier: "free",
    fixedCreditCost: 0,
    callsProvider: false,
    launchFeature: "enableExportPack",
    toolboxGroup: "optimize",
  },
  {
    id: "export_asset",
    labelEn: "Export",
    labelDe: "Export",
    descriptionEn: "Download a generated asset to your device.",
    descriptionDe: "Lade ein generiertes Asset auf dein Gerät herunter.",
    outputType: "image",
    statusWhenReady: "available",
    accessTier: "free",
    actionId: "export_asset",
    fixedCreditCost: 0,
    callsProvider: false,
    toolboxGroup: "optimize",
  },
  {
    id: "animate_image",
    labelEn: "Animate Image",
    labelDe: "Bild animieren",
    descriptionEn: "Turn an existing image into motion.",
    descriptionDe: "Verwandle ein bestehendes Bild in Bewegung.",
    outputType: "video",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    actionId: "animate_image",
    fixedCreditCost: ANIMATE_IMAGE_CREDITS,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "imageToVideo",
    primaryEngineId: ANIMATE_IMAGE_ENGINE_ID,
    toolboxGroup: "animate",
  },
  {
    id: "lipsync_creator",
    labelEn: "LipSync Creator",
    labelDe: "LipSync Creator",
    descriptionEn: "Create talking creator videos.",
    descriptionDe: "Erstelle sprechende Creator-Videos.",
    outputType: "video",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "lipsync_creator",
    fixedCreditCost: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "lipSync",
    primaryEngineId: LIPSYNC_CREATOR_ENGINE_ID,
    toolboxGroup: "animate",
  },
  {
    id: "ai_avatar",
    labelEn: "AI Avatar",
    labelDe: "AI Avatar",
    descriptionEn: "Generate avatar-style creator videos.",
    descriptionDe: "Erstelle Avatar-Videos im Creator-Stil.",
    outputType: "video",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "ai_avatar",
    fixedCreditCost: AI_AVATAR_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "avatar",
    primaryEngineId: AI_AVATAR_ENGINE_ID,
    toolboxGroup: "animate",
  },
  {
    id: "enhance_asset",
    labelEn: "Enhance Asset",
    labelDe: "Asset verbessern",
    descriptionEn: "Upscale or clean up your asset.",
    descriptionDe: "Skaliere hoch oder bereinige dein Asset.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    planGate: "creator",
    actionId: "enhance_asset",
    fixedCreditCost: 3,
    chargesCredits: true,
    allowsPreview: true,
    callsProvider: true,
    launchModule: "enhancer",
    toolboxGroup: "edit",
  },
  {
    id: "background_remove",
    labelEn: "Background Remove",
    labelDe: "Hintergrund entfernen",
    descriptionEn: "Remove backgrounds from product or creator assets.",
    descriptionDe:
      "Entferne Hintergründe von Produkt- oder Creator-Assets.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    planGate: "creator",
    actionId: "background_remove",
    fixedCreditCost: 2,
    chargesCredits: true,
    allowsPreview: true,
    callsProvider: true,
    launchModule: "enhancer",
    toolboxGroup: "edit",
  },
  {
    id: "upscale_image",
    labelEn: "Upscale",
    labelDe: "Hochskalieren",
    descriptionEn: "Prepare your asset for higher-quality export.",
    descriptionDe: "Bereite dein Asset für Export in höherer Qualität vor.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    planGate: "creator",
    actionId: "upscale_image",
    fixedCreditCost: 3,
    chargesCredits: true,
    allowsPreview: true,
    callsProvider: true,
    launchModule: "enhancer",
    toolboxGroup: "edit",
  },
  {
    id: "object_3d",
    labelEn: "3D Object",
    labelDe: "3D-Objekt",
    descriptionEn: "Create 3D-style product assets.",
    descriptionDe: "Erstelle Produkt-Assets im 3D-Stil.",
    outputType: "three_d",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "object_3d",
    fixedCreditCost: OBJECT_3D_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "threeD",
    primaryEngineId: OBJECT_3D_ENGINE_ID,
    toolboxGroup: "advanced",
  },
  {
    id: "motion_transfer",
    labelEn: "Motion Transfer",
    labelDe: "Motion Transfer",
    descriptionEn:
      "Apply a motion style or reference movement to a creator asset.",
    descriptionDe:
      "Wende einen Motion-Stil oder Referenzbewegung auf ein Creator-Asset an.",
    outputType: "video",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "motion_transfer",
    fixedCreditCost: MOTION_TRANSFER_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "motionTransfer",
    primaryEngineId: MOTION_TRANSFER_ENGINE_ID,
    toolboxGroup: "animate",
  },
  {
    id: "audio_sound_design",
    labelEn: "Audio Sound Design",
    labelDe: "Audio Sound Design",
    descriptionEn: "Create sound or audio ideas for creator videos.",
    descriptionDe: "Erstelle Sound- oder Audio-Ideen für Creator-Videos.",
    outputType: "audio",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    actionId: "audio_sound_design",
    fixedCreditCost: AUDIO_SOUND_DESIGN_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "audio",
    primaryEngineId: AUDIO_SOUND_DESIGN_ENGINE_ID,
    toolboxGroup: "advanced",
  },
  {
    id: "use_reference_image",
    labelEn: "Use Reference Image",
    labelDe: "Referenzbild nutzen",
    descriptionEn:
      "Create a new asset using an uploaded image as visual reference.",
    descriptionDe:
      "Erstelle ein neues Asset mit einem hochgeladenen Referenzbild.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    planGate: "creator",
    actionId: "use_reference_image",
    fixedCreditCost: 5,
    chargesCredits: true,
    allowsPreview: true,
    callsProvider: true,
    launchModule: "referenceImage",
    toolboxGroup: "edit",
  },
  {
    id: "edit_image",
    labelEn: "Edit Image",
    labelDe: "Bild bearbeiten",
    descriptionEn:
      "Change style, background, lighting or composition of an existing image.",
    descriptionDe:
      "Ändere Stil, Hintergrund, Licht oder Komposition eines Bildes.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    planGate: "creator",
    actionId: "edit_image",
    fixedCreditCost: 5,
    chargesCredits: true,
    allowsPreview: true,
    callsProvider: true,
    launchModule: "referenceEdit",
    toolboxGroup: "edit",
  },
  {
    id: "match_style",
    labelEn: "Match Style",
    labelDe: "Stil anpassen",
    descriptionEn:
      "Use a reference image to match mood, color and visual style.",
    descriptionDe:
      "Passe Stimmung, Farbe und visuellen Stil an ein Referenzbild an.",
    outputType: "image",
    statusWhenReady: "credit_gated",
    accessTier: "creator",
    planGate: "creator",
    actionId: "match_style",
    fixedCreditCost: 5,
    chargesCredits: true,
    allowsPreview: true,
    callsProvider: true,
    launchModule: "referenceEdit",
    toolboxGroup: "edit",
  },
  {
    id: "train_creator_style",
    labelEn: "Train Creator Style",
    labelDe: "Creator-Stil trainieren",
    descriptionEn:
      "Train a reusable visual style from your own creator assets.",
    descriptionDe:
      "Trainiere einen wiederverwendbaren visuellen Stil aus deinen Creator-Assets.",
    outputType: "model",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "train_creator_style",
    fixedCreditCost: TRAIN_CREATOR_STYLE_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "training",
    primaryEngineId: TRAIN_CREATOR_STYLE_ENGINE_ID,
    toolboxGroup: "train",
  },
  {
    id: "train_brand_kit",
    labelEn: "Train Brand Kit",
    labelDe: "Brand Kit trainieren",
    descriptionEn: "Train a consistent brand visual system.",
    descriptionDe: "Trainiere ein konsistentes Marken-Visual-System.",
    outputType: "model",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "train_brand_kit",
    fixedCreditCost: TRAIN_BRAND_KIT_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "training",
    primaryEngineId: TRAIN_BRAND_KIT_ENGINE_ID,
    toolboxGroup: "train",
  },
  {
    id: "train_product_model",
    labelEn: "Train Product Model",
    labelDe: "Produktmodell trainieren",
    descriptionEn: "Train a reusable product model for consistent visuals.",
    descriptionDe:
      "Trainiere ein wiederverwendbares Produktmodell für konsistente Visuals.",
    outputType: "model",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "train_product_model",
    fixedCreditCost: TRAIN_PRODUCT_MODEL_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "training",
    primaryEngineId: TRAIN_PRODUCT_MODEL_ENGINE_ID,
    toolboxGroup: "train",
  },
  {
    id: "train_creator_identity",
    labelEn: "Train Creator Identity",
    labelDe: "Creator Identity trainieren",
    descriptionEn:
      "Create more consistent creator-style visuals from an approved image set.",
    descriptionDe:
      "Erstelle konsistentere Creator-Visuals aus einem freigegebenen Bildset.",
    outputType: "model",
    statusWhenReady: "credit_gated",
    accessTier: "pro",
    planGate: "pro",
    actionId: "train_creator_identity",
    fixedCreditCost: TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
    chargesCredits: true,
    allowsRequestAccess: true,
    callsProvider: true,
    launchModule: "training",
    primaryEngineId: TRAIN_CREATOR_IDENTITY_ENGINE_ID,
    toolboxGroup: "train",
  },
] as const;

const TOOL_BY_ID = new Map<CreatorToolId, CreatorToolDefinition>(
  CREATOR_TOOL_REGISTRY.map((tool) => [tool.id, tool])
);

export function normalizeCreatorToolId(rawId: string): CreatorToolId | null {
  const trimmed = rawId.trim();
  if (!trimmed) return null;
  const alias = CREATOR_TOOL_ALIASES[trimmed] ?? trimmed;
  return TOOL_BY_ID.has(alias as CreatorToolId)
    ? (alias as CreatorToolId)
    : null;
}

export function getCreatorToolById(
  toolId: string
): CreatorToolDefinition | null {
  const id = normalizeCreatorToolId(toolId);
  if (!id) return null;
  return TOOL_BY_ID.get(id) ?? null;
}

export function getAllCreatorTools(): readonly CreatorToolDefinition[] {
  return CREATOR_TOOL_REGISTRY;
}

/** Whether the mapped launch engine passed validation and can run generation. */
export function isCreatorToolProviderValidated(
  tool: CreatorToolDefinition
): boolean {
  if (!tool.callsProvider) return true;

  if (!isCreatorToolLaunchGateOpen(tool)) {
    return false;
  }

  if (tool.id === "social_asset_pack") {
    return isSocialAssetPackDeploymentReady();
  }

  if (
    tool.id === "use_reference_image" ||
    tool.id === "edit_image" ||
    tool.id === "match_style" ||
    tool.id === "enhance_asset" ||
    tool.id === "background_remove" ||
    tool.id === "upscale_image" ||
    tool.id === "animate_image" ||
    tool.id === "lipsync_creator" ||
    tool.id === "ai_avatar" ||
    tool.id === "motion_transfer" ||
    tool.id === "object_3d" ||
    tool.id === "audio_sound_design" ||
    tool.id === "train_creator_style" ||
    tool.id === "train_brand_kit" ||
    tool.id === "train_product_model" ||
    tool.id === "train_creator_identity"
  ) {
    const candidateEngineIds = [
      ...(tool.primaryEngineId ? [tool.primaryEngineId] : []),
      ...(tool.actionId
        ? (getActionById(tool.actionId)?.allowedEngines ?? [])
        : []),
    ];
    return candidateEngineIds.some((engineId) => {
      const engine = getEngineById(engineId);
      return Boolean(engine && isEngineActive(engine));
    });
  }

  if (!tool.primaryEngineId) {
    const action = tool.actionId ? getActionById(tool.actionId) : null;
    const defaultEngineId = action?.defaultEngine;
    if (!defaultEngineId) return false;
    const engine = getEngineById(defaultEngineId);
    return Boolean(engine && isEngineActive(engine));
  }

  const engine = getEngineById(tool.primaryEngineId);
  return Boolean(engine && isEngineActive(engine));
}

export function resolveCreatorToolCreditCost(tool: CreatorToolDefinition): number {
  const centralized = getCreatorToolCreditCost(tool.id);
  if (centralized > 0) return centralized;

  if (typeof tool.fixedCreditCost === "number" && tool.fixedCreditCost > 0) {
    return tool.fixedCreditCost;
  }

  const action = tool.actionId ? getActionById(tool.actionId) : null;
  if (typeof action?.cost === "number") return action.cost;

  if (tool.primaryEngineId) {
    try {
      return resolveEngineCredits(tool.primaryEngineId);
    } catch {
      return 0;
    }
  }

  if (action?.defaultEngine) {
    try {
      return resolveEngineCredits(action.defaultEngine);
    } catch {
      return 0;
    }
  }

  return 0;
}

export function getCreatorToolLabel(
  tool: CreatorToolDefinition,
  language: "en" | "de" = "en"
): string {
  return language === "de" ? tool.labelDe : tool.labelEn;
}

export function getCreatorToolDescription(
  tool: CreatorToolDefinition,
  language: "en" | "de" = "en"
): string {
  const lang = language === "de" ? "de" : "en";
  const curated = getModelExplanation(tool.id, lang);
  if (curated) return curated;
  return language === "de" ? tool.descriptionDe : tool.descriptionEn;
}

export function getCreatorToolboxGroup(
  groupId: CreatorToolboxGroupId
): CreatorToolboxGroupDefinition | null {
  return CREATOR_TOOLBOX_GROUPS.find((group) => group.id === groupId) ?? null;
}

export function getCreatorToolboxTools(
  groupId: CreatorToolboxGroupId
): CreatorToolDefinition[] {
  const group = getCreatorToolboxGroup(groupId);
  if (!group) return [];
  return group.toolIds
    .map((id) => getCreatorToolById(id))
    .filter((tool): tool is CreatorToolDefinition => tool != null);
}
