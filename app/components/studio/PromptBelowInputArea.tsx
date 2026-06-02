"use client";

import { CREATE_PAGE } from "@/lib/copy/launch-user-copy";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import PromptAssistControls from "./PromptAssistControls";
import PromptGuidanceChips from "./PromptGuidanceChips";

type Props = {
  prompt: string;
  modelModeId: string;
  actionId: "create_image" | "create_video";
  language: "en" | "de";
  modelSelectable: boolean;
  onAppendPrompt: (fragment: string) => void;
  onUseImproved: (improved: string) => void;
};

/**
 * Stable-height slot below the prompt — chips always visible; assist toggles in-place.
 */
export default function PromptBelowInputArea({
  prompt,
  modelModeId,
  actionId,
  language,
  modelSelectable,
  onAppendPrompt,
  onUseImproved,
}: Props) {
  const isDe = language === "de";
  const hasPrompt = prompt.trim().length > 0;

  return (
    <div className="relative min-h-[10.5rem] px-1 sm:min-h-[9.75rem]">
      <p className={A11Y.mutedBody}>
        {isDe ? CREATE_PAGE.promptEmptyHelper.de : CREATE_PAGE.promptEmptyHelper.en}
      </p>

      <div className="mt-2">
        <PromptGuidanceChips language={language} onAppend={onAppendPrompt} />
      </div>

      <div
        className={
          hasPrompt
            ? "relative mt-3"
            : "pointer-events-none invisible absolute inset-x-1 top-[7.25rem] h-0 overflow-hidden sm:top-[6.75rem]"
        }
        aria-hidden={!hasPrompt}
      >
        <PromptAssistControls
          prompt={prompt}
          modelModeId={modelModeId}
          actionId={actionId}
          language={language}
          disabled={!modelSelectable}
          onUseImproved={onUseImproved}
        />
      </div>
    </div>
  );
}
