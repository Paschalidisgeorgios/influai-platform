"use client";

import { Loader2 } from "lucide-react";
import StickyCreditCostBar, {
  type StickyCreditWorkflow,
} from "@/app/components/studio/StickyCreditCostBar";
import { GENERATOR_OVERLAY_COPY } from "@/lib/studio/generator-overlay-copy";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  language?: "en" | "de";
  modeLabel: string;
  creditCost: number;
  creditBalance: number;
  creditsConfirmed?: boolean;
  workflow: StickyCreditWorkflow;
  packCtaLabel?: string;
  isGenerating?: boolean;
  actionDisabled?: boolean;
  onPrimaryAction: () => void;
  onBuyCredits: () => void;
  showPreview?: boolean;
  previewDisabled?: boolean;
  onPreview?: () => void;
  previewLabel?: string;
};

export default function GeneratorOverlayFooter({
  language = "en",
  modeLabel,
  creditCost,
  creditBalance,
  creditsConfirmed = true,
  workflow,
  packCtaLabel,
  isGenerating = false,
  actionDisabled = false,
  onPrimaryAction,
  onBuyCredits,
  showPreview = false,
  previewDisabled = false,
  onPreview,
  previewLabel,
}: Props) {
  const isDe = language === "de";

  const previewCta =
    previewLabel ??
    (isDe
      ? GENERATOR_OVERLAY_COPY.previewFree.de
      : GENERATOR_OVERLAY_COPY.previewFree.en);

  const primaryLabel =
    packCtaLabel ??
    (isDe ? `Render · ${creditCost} Credits` : `Render · ${creditCost} credits`);

  if (showPreview && onPreview) {
    return (
      <footer className="sticky bottom-0 z-10 shrink-0 border-t border-[rgba(255,165,0,0.15)] bg-[#0a0a0a] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={previewDisabled || isGenerating}
            onClick={onPreview}
            className={`${obsidianButtonClass("secondary", { size: "md" })} ${A11Y.disabled} w-full border-white/10 text-neutral-200 hover:border-amber-500/35 sm:w-auto sm:min-w-[10.5rem]`}
          >
            {previewCta}
          </button>
          <button
            type="button"
            disabled={actionDisabled || isGenerating}
            onClick={onPrimaryAction}
            className={`${obsidianButtonClass("primary", { size: "md" })} ${A11Y.disabled} w-full gap-2 shadow-[0_0_24px_rgba(245,158,11,0.2)] sm:w-auto sm:min-w-[12rem]`}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {primaryLabel}
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="sticky bottom-0 z-10 shrink-0 border-t border-[rgba(255,165,0,0.15)] bg-[#0a0a0a]">
      <StickyCreditCostBar
        variant="docked"
        language={language}
        modeLabel={modeLabel}
        creditCost={creditCost}
        creditBalance={creditBalance}
        creditsConfirmed={creditsConfirmed}
        workflow={workflow}
        packCtaLabel={packCtaLabel}
        isGenerating={isGenerating}
        actionDisabled={actionDisabled}
        onPrimaryAction={onPrimaryAction}
        onBuyCredits={onBuyCredits}
      />
    </footer>
  );
}
