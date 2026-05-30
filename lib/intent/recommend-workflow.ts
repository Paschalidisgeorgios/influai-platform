import type { FormatHint, IntentSignals, WorkflowRecommendation } from "./types";

function formatToStudioId(format: FormatHint): string {
  switch (format) {
    case "vertical":
    case "thumbnail":
      return "vertical";
    case "cinematic":
    case "horizontal":
      return "cinematic";
    case "square":
      return "square";
    default:
      return "square";
  }
}

/**
 * Maps analyzed intent → dashboard entry point + engine preset.
 * Internal engine IDs align with white-label registry; provider stays server-side.
 */
export function recommendWorkflow(signals: IntentSignals): WorkflowRecommendation {
  const formatId = formatToStudioId(signals.formatHint);

  switch (signals.primaryModality) {
    case "lip_sync":
      return {
        toolKey: "lip_sync",
        engineId: "lip-sync-studio",
        formatId: signals.formatHint === "unknown" ? "vertical" : formatId,
        href: "/dashboard/lipsync",
        reasonEn: "Voice-driven portrait sync detected — routing to Lip-Sync Studio.",
        reasonDe: "Stimmgesteuerte Portrait-Synchronisation erkannt — Weiterleitung zum Lip-Sync Studio.",
        confidence: signals.confidence,
      };
    case "motion":
      return {
        toolKey: "motion",
        engineId: "live-avatar",
        formatId: signals.formatHint === "unknown" ? "vertical" : formatId,
        href: "/dashboard/motion-transfer",
        reasonEn: "Motion transfer intent — open Motion Studio.",
        reasonDe: "Motion-Transfer erkannt — Motion Studio öffnen.",
        confidence: signals.confidence,
      };
    case "video":
      return {
        toolKey: "video",
        engineId: "kling-3",
        formatId: signals.formatHint === "square" ? "cinematic" : formatId,
        durationSeconds: 5,
        href: "/dashboard/video",
        reasonEn: "Cinematic motion language detected — Kling 3.0 preset selected.",
        reasonDe: "Kinematische Bewegungssprache erkannt — Kling 3.0 Preset gewählt.",
        confidence: signals.confidence,
      };
    case "enhance":
      return {
        toolKey: "enhance",
        engineId: "krea-2-large",
        formatId,
        href: "/dashboard/image",
        reasonEn: "Enhancement keywords found — high-fidelity image pipeline.",
        reasonDe: "Enhancement-Schlüsselwörter erkannt — High-Fidelity Bild-Pipeline.",
        confidence: signals.confidence,
      };
    case "image":
    default:
      return {
        toolKey: "image",
        engineId: signals.wordCount < 8 ? "nano-banana" : "krea-2-large",
        formatId,
        href: "/dashboard/image",
        reasonEn:
          signals.wordCount < 8
            ? "Short prompt — fast concept engine for rapid ideation."
            : "Detailed brief — flagship image engine for campaign-ready output.",
        reasonDe:
          signals.wordCount < 8
            ? "Kurzer Prompt — schnelle Konzept-Engine für Ideation."
            : "Ausführliches Briefing — Flaggschiff-Bild-Engine für Kampagnen-Output.",
        confidence: signals.confidence,
      };
  }
}
