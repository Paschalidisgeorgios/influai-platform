"use client";

import { getModePromptHint, formatBestForLine } from "@/app/lib/model-modes/mode-copy";

type Props = {
  modelModeId: string;
  language?: "en" | "de";
  className?: string;
};

export default function ModeHelpText({
  modelModeId,
  language = "en",
  className = "",
}: Props) {
  const hint = getModePromptHint(modelModeId, language);
  if (!hint) return null;

  return (
    <p className={`text-xs leading-relaxed text-neutral-500 ${className}`}>
      <span className="font-medium text-neutral-400">
        {language === "de" ? "Tipp" : "Tip"}:
      </span>{" "}
      {hint}
    </p>
  );
}

export function ModeBestForText({
  modelModeId,
  language = "en",
  className = "",
}: Props) {
  const line = formatBestForLine(modelModeId, language);
  if (!line) return null;
  return (
    <p className={`text-[11px] text-neutral-500 ${className}`}>{line}</p>
  );
}
