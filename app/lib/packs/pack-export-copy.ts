/**
 * Export Pack copy for Social Asset Pack showcase — basic export is free for paid assets.
 */

import { EXPORT_PACK_HD_UPSCALE_CREDIT_HINT } from "@/app/lib/export/export-pack";

export const PACK_EXPORT_COPY = {
  en: {
    title: "Export Pack",
    description: "Prepare your assets for TikTok, Reels, Story and Feed.",
    cta: "Export Pack",
    exportIncluded: "Export included",
    includedInRenderNote:
      "Export formats are included in your pack render — no extra charge at download.",
    buildingNote: "Export formats unlock when your pack finishes rendering.",
    previewNote: "Export is included when you render — no surprise charges at download.",
    freeExportNote: "Download your generated assets anytime — no additional credits.",
    hdUpscaleNote:
      "Optional HD upscale is a separate paid render — only runs if you choose it.",
    formatsLabel: "Platform formats",
  },
  de: {
    title: "Export Pack",
    description:
      "Bereite deine Assets für TikTok, Reels, Story und Feed vor.",
    cta: "Export Pack",
    exportIncluded: "Export inklusive",
    includedInRenderNote:
      "Export-Formate sind im Pack-Render enthalten — kein Aufpreis beim Download.",
    buildingNote: "Export-Formate werden freigeschaltet, sobald dein Pack fertig ist.",
    previewNote:
      "Export ist im Render enthalten — keine Überraschungskosten beim Download.",
    freeExportNote:
      "Lade generierte Assets jederzeit herunter — ohne zusätzliche Credits.",
    hdUpscaleNote:
      "Optionales HD-Upscale ist ein separater Paid-Render — läuft nur auf deine Auswahl.",
    formatsLabel: "Plattform-Formate",
  },
} as const;

export function formatHdExportCta(credits: number, language: "en" | "de"): string {
  const formatted = credits.toLocaleString(language === "de" ? "de-DE" : "en-US");
  return language === "de"
    ? `HD-Export rendern · ${formatted} Credits`
    : `Render HD Export · ${formatted} Credits`;
}

export function getDefaultHdExportCredits(): number {
  return EXPORT_PACK_HD_UPSCALE_CREDIT_HINT;
}
