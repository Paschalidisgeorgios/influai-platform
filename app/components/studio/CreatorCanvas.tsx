"use client";

import { useMemo } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import PostGenerationPanel from "./PostGenerationPanel";
import { CREATE_PAGE } from "@/lib/copy/launch-user-copy";
import { PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { type CreatorCanvasAsset } from "./canvas-types";

type Props = {
  asset: CreatorCanvasAsset | null;
  modelModeId?: string | null;
  creditsUsed?: number;
  creditBalance?: number;
  isDe?: boolean;
  selected?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  getToken: () => Promise<string | null>;
  onCreditsUsed?: (payload?: { creditsAfter?: number | null }) => void;
  onAssetCreated?: (asset: CreatorCanvasAsset) => void;
  onVariantNotice?: (message: string | null) => void;
  onRegenerateWithMode?: (modelModeId: string, prompt: string) => void;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  initialAction?: "variant" | "score" | null;
};

const WORKSPACE_SHELL = `relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-dashed border-white/[0.12] ${PREMIUM_CLASSES.glassCard}`;

export default function CreatorCanvas({
  asset,
  modelModeId,
  creditsUsed,
  creditBalance = 0,
  isDe = false,
  selected = true,
  loading = false,
  loadingMessage,
  getToken,
  onCreditsUsed,
  onAssetCreated,
  onVariantNotice,
  onRegenerateWithMode,
  onBuyCredits,
  onUpgrade,
  initialAction = null,
}: Props) {
  const resolvedModelModeId = modelModeId ?? asset?.modelModeId;
  const resolvedCreditsUsed = creditsUsed ?? asset?.creditsUsed;
  const language = useMemo(() => (isDe ? "de" : "en"), [isDe]);

  if (loading) {
    return (
      <div
        className={`${WORKSPACE_SHELL} relative flex min-h-[42vh] flex-col overflow-hidden`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(139,92,246,0.12),transparent_70%)]" />
          <div className="absolute left-1/2 top-1/3 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#8B5CF6]/20 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          <Loader2
            className="h-10 w-10 animate-spin text-[#8B5CF6]"
            aria-hidden
          />
          <p className="mt-4 text-sm font-medium text-[#9CA3AF]">
            {loadingMessage ??
              (isDe ? "Generierung läuft …" : "Generation in progress …")}
          </p>
          <div
            aria-hidden
            className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-white/[0.06]"
          >
            <div className="h-full w-2/5 animate-pulse rounded-full bg-[#8B5CF6]/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!asset?.url) {
    return (
      <div
        className={`${WORKSPACE_SHELL} relative flex min-h-[42vh] flex-col overflow-hidden text-center`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(34,211,238,0.06),transparent_65%)]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0E1220]/80">
            <ImageIcon className="h-6 w-6 text-[#8B5CF6]/70" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="max-w-sm text-sm text-[#9CA3AF]">
            {isDe ? CREATE_PAGE.canvasEmpty.de : CREATE_PAGE.canvasEmpty.en}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-4xl space-y-4 ${
        selected ? "rounded-3xl p-1 ring-1 ring-[#8B5CF6]/20" : ""
      }`}
    >
      <PostGenerationPanel
        asset={asset}
        modelModeId={resolvedModelModeId}
        creditsUsed={resolvedCreditsUsed}
        creditBalance={creditBalance}
        language={language}
        getToken={getToken}
        onCreditsUsed={onCreditsUsed}
        onAssetCreated={onAssetCreated}
        onVariantNotice={onVariantNotice}
        onRegenerateWithMode={onRegenerateWithMode}
        onBuyCredits={onBuyCredits}
        onUpgrade={onUpgrade}
        initialAction={initialAction}
        showPreview
      />
    </div>
  );
}
