"use client";

import type { ReactNode } from "react";
import CommandBar from "@/app/dashboard/components/obsidian/CommandBar";
import {
  CREATE_PAGE,
  getEstimatedCostLabel,
  getInsufficientCreditsMessage,
  CREDITS_PAGE,
} from "@/lib/copy/launch-user-copy";

type Pill = { id: string; label: string };

export type SmartCommandBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  /** @deprecated use onGenerate */
  onSubmit?: () => void;
  isGenerating?: boolean;
  /** @deprecated use isGenerating */
  loading?: boolean;
  selectedModelLabel?: string;
  /** @deprecated use selectedModelLabel */
  engineLabel?: string;
  selectedModelCredits?: number;
  /** @deprecated use selectedModelCredits */
  creditCost?: number;
  creditsAvailable?: number | null;
  currentLanguage: "de" | "en";
  placeholder?: string;
  recommendationText?: string;
  disabled?: boolean;
  submitLabel?: string;
  formatLabel?: string;
  pills?: Pill[];
  headerSlot?: ReactNode;
  errorMessage?: string | null;
  autoFocus?: boolean;
  typewriterPlaceholders?: readonly string[];
  /** Override default "What do you want to create?" heading */
  commandHeading?: string;
  /** Override default create-page subtitle */
  commandSubtitle?: string;
  /** Hide built-in headline (use CreatePageHeader instead) */
  hideHeader?: boolean;
  /** Content below the prompt input (presets, prompt assist) */
  belowInputSlot?: ReactNode;
  /** When set, clicking submit while insufficient opens billing */
  onInsufficientCredits?: () => void;
  /** Hide generate button — workflow supplies its own CTAs */
  hideSubmit?: boolean;
  /** Typewriter prompt ghost — generator overlay only */
  enableTypewriterGhost?: boolean;
};

export default function SmartCommandBox({
  value,
  onChange,
  onGenerate,
  onSubmit,
  isGenerating,
  loading,
  selectedModelLabel,
  engineLabel,
  selectedModelCredits,
  creditCost,
  creditsAvailable,
  currentLanguage,
  recommendationText,
  disabled = false,
  submitLabel,
  formatLabel,
  pills = [],
  headerSlot,
  errorMessage,
  autoFocus = true,
  typewriterPlaceholders,
  commandHeading,
  commandSubtitle,
  belowInputSlot,
  hideHeader = false,
  placeholder,
  onInsufficientCredits,
  hideSubmit = false,
  enableTypewriterGhost = false,
}: SmartCommandBoxProps) {
  const isDe = currentLanguage === "de";
  const generating = isGenerating ?? loading ?? false;
  const modelLabel = selectedModelLabel ?? engineLabel;
  const modelCredits = selectedModelCredits ?? creditCost;
  const handleSubmit = onGenerate ?? onSubmit ?? (() => {});

  const insufficientCredits =
    typeof creditsAvailable === "number" &&
    modelCredits != null &&
    creditsAvailable < modelCredits;

  const onSubmitWrapped = () => {
    if (insufficientCredits) {
      onInsufficientCredits?.();
      return;
    }
    handleSubmit();
  };

  const metaPills: Pill[] = [
    ...(modelLabel
      ? [{ id: "engine", label: isDe ? `Modus · ${modelLabel}` : `Mode · ${modelLabel}` }]
      : []),
    ...(modelCredits != null
      ? [
          {
            id: "credits",
            label: getEstimatedCostLabel(modelCredits, isDe),
          },
        ]
      : []),
    ...(typeof creditsAvailable === "number"
      ? [
          {
            id: "balance",
            label: isDe
              ? `${CREDITS_PAGE.balance.de} · ${creditsAvailable.toLocaleString(isDe ? "de-DE" : "en-US")}`
              : `${CREDITS_PAGE.balance.en} · ${creditsAvailable.toLocaleString(isDe ? "de-DE" : "en-US")}`,
          },
        ]
      : []),
    ...(formatLabel
      ? [{ id: "format", label: isDe ? `Format · ${formatLabel}` : `Format · ${formatLabel}` }]
      : []),
    ...pills.filter((p) => !["engine", "cost", "credits", "balance", "format"].includes(p.id)),
  ];

  return (
    <section className="mx-auto w-full max-w-5xl" aria-label={isDe ? "Prompt" : "Prompt"}>
      {!hideHeader ? (
        <>
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]/80">
            {commandHeading ?? (isDe ? CREATE_PAGE.headline.de : CREATE_PAGE.headline.en)}
          </p>
          <p className="mb-3 text-center text-sm leading-relaxed text-[#9CA3AF]">
            {commandSubtitle ?? (isDe ? CREATE_PAGE.subtitle.de : CREATE_PAGE.subtitle.en)}
          </p>
        </>
      ) : null}
      {insufficientCredits && modelCredits != null ? (
        <p
          role="status"
          className="mb-3 text-center text-xs font-medium text-[#F59E0B]/90"
        >
          {getInsufficientCreditsMessage(modelCredits, isDe)}
        </p>
      ) : null}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]/80 focus-within:border-[#8B5CF6]/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-[#22D3EE]/40" />
          <div className="absolute -inset-4 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.12),transparent_65%)]" />
        </div>
        <div className="relative z-10">
        <CommandBar
          value={value}
          onChange={onChange}
          onSubmit={onSubmitWrapped}
          loading={generating}
          disabled={disabled}
          submitLabel={submitLabel}
          pills={metaPills}
          headerSlot={headerSlot}
          floating={false}
          embedded
          className="w-full"
          autoFocus={autoFocus}
          typewriterPlaceholders={typewriterPlaceholders}
          placeholder={placeholder}
          hideSubmit={hideSubmit}
          enableTypewriterGhost={enableTypewriterGhost}
        />
        </div>
      </div>
      {belowInputSlot ? (
        <div className="mt-4 px-1">{belowInputSlot}</div>
      ) : null}
      <p className="mt-3 min-h-[1.125rem] text-center text-xs text-[#F59E0B]/90" role="status">
        {recommendationText ?? "\u00a0"}
      </p>
      <div
        role="alert"
        className={`mx-auto mt-2 w-full overflow-hidden transition-[max-height,opacity] duration-200 ${
          errorMessage ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {errorMessage ? (
          <div className="rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#FCA5A5]">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}
