import {
  getKreaModelById,
  isKreaPlanLimitedModel,
  kreaPlanLimitUserMessage,
  type KreaModelConfig,
} from "@/lib/ai/krea-model-registry";
import { isModelPickerSelectable } from "@/lib/dashboard/studio-white/model-availability";

export type MotionGenerateBlockReason =
  | "MISSING_SOURCE_IMAGE"
  | "MISSING_SOURCE_VIDEO"
  | "MISSING_CONSENT"
  | "MISSING_MODEL"
  | "MODEL_NOT_ACTIVE"
  | "KREA_PLAN_LIMIT"
  | "INSUFFICIENT_CREDITS"
  | "UPLOAD_IN_PROGRESS"
  | "RECORDING_IN_PROGRESS";

export type MotionGenerateBlockParams = {
  sourceImageUrl?: string | null;
  sourceVideoUrl?: string | null;
  consentAccepted: boolean;
  selectedModel?: Pick<KreaModelConfig, "id" | "availability" | "credits" | "category"> | null;
  selectedModelId?: string | null;
  credits?: number | null;
  isUploading?: boolean;
  isRecording?: boolean;
};

function resolveSelectedModel(
  params: MotionGenerateBlockParams
): Pick<KreaModelConfig, "id" | "availability" | "credits" | "category"> | null {
  if (params.selectedModel) return params.selectedModel;
  const id = params.selectedModelId?.trim();
  if (!id) return null;
  const entry = getKreaModelById(id);
  if (!entry) return null;
  return entry;
}

function isRemoteUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0 && !url.startsWith("blob:");
}

/** Returns the first blocking reason, or null when generate is allowed. */
export function getMotionGenerateBlockReason(
  params: MotionGenerateBlockParams
): MotionGenerateBlockReason | null {
  if (params.isUploading) return "UPLOAD_IN_PROGRESS";
  if (params.isRecording) return "RECORDING_IN_PROGRESS";
  if (!isRemoteUrl(params.sourceImageUrl)) return "MISSING_SOURCE_IMAGE";
  if (!isRemoteUrl(params.sourceVideoUrl)) return "MISSING_SOURCE_VIDEO";
  if (!params.consentAccepted) return "MISSING_CONSENT";

  const model = resolveSelectedModel(params);
  if (!model || model.category !== "motion_transfer") return "MISSING_MODEL";

  const entry = getKreaModelById(model.id);
  if (entry && isKreaPlanLimitedModel(entry)) return "KREA_PLAN_LIMIT";
  if (!isModelPickerSelectable(model.availability)) return "MODEL_NOT_ACTIVE";

  const modelCredits = model.credits ?? 0;
  if (typeof params.credits === "number" && params.credits < modelCredits) {
    return "INSUFFICIENT_CREDITS";
  }

  return null;
}

const BLOCK_COPY: Record<
  MotionGenerateBlockReason,
  { en: string; de: string }
> = {
  MISSING_SOURCE_IMAGE: {
    en: "Upload a source character portrait to continue.",
    de: "Lade ein Quell-Porträt hoch, um fortzufahren.",
  },
  MISSING_SOURCE_VIDEO: {
    en: "Upload or record a driving motion video to continue.",
    de: "Lade ein Bewegungs-Video hoch oder nimm eines auf, um fortzufahren.",
  },
  MISSING_CONSENT: {
    en: "Confirm consent before generating.",
    de: "Bestätige die Zustimmung, bevor du generierst.",
  },
  MISSING_MODEL: {
    en: "Select a motion transfer engine.",
    de: "Wähle eine Motion-Transfer-Engine.",
  },
  MODEL_NOT_ACTIVE: {
    en: "The selected engine is not fully connected yet — no credits will be charged.",
    de: "Die ausgewählte Engine ist noch nicht vollständig angebunden — es werden keine Credits abgezogen.",
  },
  KREA_PLAN_LIMIT: {
    en: "This engine is not available with your current Krea API plan.",
    de: "Diese Engine ist mit deinem aktuellen Krea API-Plan nicht verfügbar.",
  },
  INSUFFICIENT_CREDITS: {
    en: "Not enough credits for this engine.",
    de: "Nicht genug Credits für diese Engine.",
  },
  UPLOAD_IN_PROGRESS: {
    en: "Wait until uploads finish.",
    de: "Warte, bis die Uploads abgeschlossen sind.",
  },
  RECORDING_IN_PROGRESS: {
    en: "Stop recording before generating.",
    de: "Stoppe die Aufnahme, bevor du generierst.",
  },
};

export function formatMotionGenerateBlockReason(
  reason: MotionGenerateBlockReason,
  language: "de" | "en" = "en"
): string {
  return BLOCK_COPY[reason][language === "de" ? "de" : "en"];
}

export function canMotionGenerate(params: MotionGenerateBlockParams): boolean {
  return getMotionGenerateBlockReason(params) === null;
}
