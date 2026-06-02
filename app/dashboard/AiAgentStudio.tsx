"use client";

import PromptIntelligenceBar from "./components/studio/PromptIntelligenceBar";
import { resolveAutoModelModeId } from "@/lib/ai/smartPromptEngine";

export type AiAgentStudioProps = {
  prompt: string;
  imageMode: string;
  platform: string;
  language: "en" | "de";
  availableModelModeIds?: readonly string[];
  onUseEnhanced: (enhanced: string) => void;
  onAutoMode: (mode: string) => void;
};

/**
 * Smart prompt intelligence layer for the creator studio command surface.
 * Mount below the main prompt input (SmartCommandBox / CommandBar textarea).
 */
export default function AiAgentStudio({
  prompt,
  imageMode,
  platform,
  language,
  availableModelModeIds = [],
  onUseEnhanced,
  onAutoMode,
}: AiAgentStudioProps) {
  return (
    <PromptIntelligenceBar
      prompt={prompt}
      imageMode={imageMode}
      platform={platform}
      language={language}
      onUseEnhanced={onUseEnhanced}
      onAutoMode={(mode) => {
        const resolved = resolveAutoModelModeId(mode, availableModelModeIds);
        if (resolved) onAutoMode(resolved);
      }}
    />
  );
}
