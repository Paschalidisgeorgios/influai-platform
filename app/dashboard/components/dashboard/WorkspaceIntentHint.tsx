"use client";

import { useMemo } from "react";
import { previewDashboardPersonalization } from "@/lib/dashboard/personalization";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

type Props = {
  prompt: string;
  engineLabel?: string;
  formatLabel?: string;
};

export default function WorkspaceIntentHint({
  prompt,
  engineLabel,
  formatLabel,
}: Props) {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";

  const intentLine = useMemo(() => {
    const trimmed = prompt.trim();
    if (trimmed.length >= 3) {
      const preview = previewDashboardPersonalization(trimmed, lang);
      return isDe ? preview.headlineDe : preview.headlineEn;
    }
    if (engineLabel && formatLabel) {
      return isDe
        ? `Empfohlener nächster Schritt: Prompt eingeben, dann mit ${engineLabel} im Format ${formatLabel} generieren.`
        : `Suggested next step: enter a prompt, then generate with ${engineLabel} in ${formatLabel} format.`;
    }
    return isDe
      ? "Empfohlener nächster Schritt: Prompt eingeben und Generate klicken."
      : "Suggested next step: enter a prompt and click Generate.";
  }, [prompt, lang, isDe, engineLabel, formatLabel]);

  return (
    <div
      className="mx-auto mt-4 w-full max-w-5xl rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3 text-center text-sm leading-relaxed text-amber-100/80"
      role="status"
    >
      <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400/80">
        {isDe ? "Workspace Intelligence" : "Workspace Intelligence"}
      </span>
      {intentLine}
    </div>
  );
}
