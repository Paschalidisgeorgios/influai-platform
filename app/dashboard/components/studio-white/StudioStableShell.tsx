"use client";

import type { ReactNode } from "react";
import StudioInnerEffectsLayer from "./StudioInnerEffectsLayer";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";
import { useAgentVisualEffectsEnabled } from "@/lib/studio/agent-visual-effects-context";

const OUTER_SHELL =
  "relative mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1220]/90 max-h-[calc(100dvh-5.5rem)] min-h-[min(640px,calc(100dvh-5.5rem))] sm:min-h-[min(640px,calc(100dvh-6rem))]";

type Props = {
  children: ReactNode;
  isGenerating?: boolean;
  /** Docked footer (e.g. credit bar) — stays inside the studio window, outside the scroll area. */
  footer?: ReactNode;
};

/**
 * Fixed outer studio window — no layout animation on this node.
 * Effects live in StudioInnerEffectsLayer; content scrolls inside.
 */
export default function StudioStableShell({
  children,
  isGenerating = false,
  footer,
}: Props) {
  const agentEffects = useAgentVisualEffectsEnabled();
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLDivElement>({
    maxPx: 10,
    disabled: !agentEffects,
  });

  return (
    <div ref={containerRef} className={OUTER_SHELL}>
      {agentEffects ? (
        <StudioInnerEffectsLayer
          isGenerating={isGenerating}
          getLayerStyle={getLayerStyle}
          enabled={enabled}
        />
      ) : null}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 sm:px-4 ${
            footer ? "pb-3 sm:pb-4" : "pb-4 sm:pb-6"
          }`}
        >
          {children}
        </div>
        {footer ? (
          <div className="relative shrink-0 border-t border-white/[0.08] bg-[#0E1220]/95">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
