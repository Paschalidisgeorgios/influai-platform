"use client";

import {
  PLATFORM_PROMPT_CHIPS,
  STARTER_PROMPT_CHIPS,
  STYLE_PROMPT_CHIPS,
  getPromptChipFragment,
  getPromptChipLabel,
  type PromptChip,
} from "@/app/lib/presets/prompt-chips";

type Props = {
  language?: "en" | "de";
  onAppend: (fragment: string) => void;
  className?: string;
};

function ChipRow({
  label,
  chips,
  language,
  onAppend,
}: {
  label: string;
  chips: readonly PromptChip[];
  language: "en" | "de";
  onAppend: (fragment: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="mr-0.5 w-[3.25rem] shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-600 sm:w-14">
        {label}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onAppend(getPromptChipFragment(chip, language))}
          className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-300 transition-[box-shadow,color] hover:text-white hover:shadow-[0_0_14px_rgba(245,158,11,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 min-h-[36px]"
        >
          {getPromptChipLabel(chip, language)}
        </button>
      ))}
    </div>
  );
}

export default function PromptGuidanceChips({
  language = "en",
  onAppend,
  className = "",
}: Props) {
  const isDe = language === "de";

  return (
    <div className={`space-y-1.5 ${className}`}>
      <ChipRow
        label={isDe ? "Ziel" : "Goal"}
        chips={STARTER_PROMPT_CHIPS}
        language={language}
        onAppend={onAppend}
      />
      <ChipRow
        label={isDe ? "Stil" : "Style"}
        chips={STYLE_PROMPT_CHIPS}
        language={language}
        onAppend={onAppend}
      />
      <ChipRow
        label={isDe ? "Plattform" : "Platform"}
        chips={PLATFORM_PROMPT_CHIPS}
        language={language}
        onAppend={onAppend}
      />
    </div>
  );
}
