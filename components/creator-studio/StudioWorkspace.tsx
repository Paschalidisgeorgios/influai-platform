"use client";

import { useCallback } from "react";
import SmartPromptInput from "@/components/creator-studio/SmartPromptInput";
import StudioCanvas from "@/components/creator-studio/StudioCanvas";
import { DEFAULT_IMAGE_MODEL_ID } from "@/config/models";
import { getFalModelById } from "@/config/models";
import { useCanvasStore } from "@/stores/canvasStore";
import { usePromptStore } from "@/stores/promptStore";
import { useUserStore } from "@/stores/userStore";
import { useUiStore } from "@/stores/uiStore";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1611936619935-5c4c4d4b0f0a?w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
];

export default function StudioWorkspace() {
  const prompt = usePromptStore((s) => s.prompt);
  const addAsset = useCanvasStore((s) => s.addAsset);
  const setGenerating = useCanvasStore((s) => s.setGenerating);
  const isGenerating = useCanvasStore((s) => s.isGenerating);
  const credits = useUserStore((s) => s.credits);
  const deductCredits = useUserStore((s) => s.deductCredits);
  const openPaywall = useUiStore((s) => s.openPaywall);
  const activeModelId = useUiStore((s) => s.activeModelId);

  const model = getFalModelById(activeModelId) ?? getFalModelById(DEFAULT_IMAGE_MODEL_ID)!;
  const creditCost = model.credits;

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() || isGenerating) return;
    if (credits < creditCost) {
      openPaywall("credits");
      return;
    }

    setGenerating(true, "Creating your image…");
    deductCredits(creditCost);

    window.setTimeout(() => {
      const url =
        PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)]!;
      addAsset({
        id: crypto.randomUUID(),
        type: "image",
        url,
        prompt: prompt.trim(),
        createdAt: new Date().toISOString(),
        modelId: model.id,
      });
      setGenerating(false);
    }, 1400);
  }, [
    addAsset,
    creditCost,
    credits,
    deductCredits,
    isGenerating,
    model.id,
    openPaywall,
    prompt,
    setGenerating,
  ]);

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/80">
          Action-first Creator Studio
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          What do you want to create?
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500">
          Smart prompts, canvas actions, Creative Score and credit-transparent
          exports — built for social creators.
        </p>
      </header>

      <SmartPromptInput
        onGenerate={handleGenerate}
        disabled={isGenerating}
        creditLabel={`${creditCost} credit${creditCost === 1 ? "" : "s"}`}
      />

      <StudioCanvas />
    </div>
  );
}
