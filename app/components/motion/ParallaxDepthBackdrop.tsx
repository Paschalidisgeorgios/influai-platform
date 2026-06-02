"use client";

import type { ReactNode } from "react";
import {
  type ParallaxLayerConfig,
  type UseSubtleParallaxResult,
} from "@/lib/motion/use-subtle-parallax";

export type ParallaxDepthVariant =
  | "landing-hero"
  | "dashboard-studio"
  | "pack-showcase"
  | "agent-panel";

export type ParallaxLayerDef = {
  className: string;
  depth: number;
  maxPx?: number;
};

const LANDING_HERO_LAYERS: ParallaxLayerDef[] = [
  {
    className:
      "absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_15%_20%,rgba(139,92,246,0.12),transparent_50%)]",
    depth: 0.35,
    maxPx: 10,
  },
  {
    className:
      "absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_30%,rgba(245,158,11,0.08),transparent_55%)]",
    depth: 0.55,
    maxPx: 12,
  },
  {
    className:
      "absolute left-[8%] top-[18%] h-56 w-56 rounded-full bg-[#8B5CF6]/14 blur-3xl",
    depth: 0.85,
    maxPx: 14,
  },
  {
    className:
      "absolute right-[10%] top-[28%] h-44 w-44 rounded-full bg-amber-500/10 blur-3xl",
    depth: 1,
    maxPx: 16,
  },
  {
    className:
      "absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]",
    depth: 0.15,
    maxPx: 4,
  },
];

const PACK_SHOWCASE_LAYERS: ParallaxLayerDef[] = [
  {
    className:
      "absolute -left-8 top-[12%] h-40 w-40 rounded-full bg-[#8B5CF6]/16 blur-3xl",
    depth: 0.9,
    maxPx: 10,
  },
  {
    className:
      "absolute -right-6 bottom-[18%] h-36 w-36 rounded-full bg-amber-500/12 blur-3xl",
    depth: 0.7,
    maxPx: 8,
  },
  {
    className:
      "absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22D3EE]/8 blur-3xl",
    depth: 0.45,
    maxPx: 6,
  },
];

const AGENT_PANEL_LAYERS: ParallaxLayerDef[] = [
  {
    className:
      "absolute -right-10 -top-14 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl",
    depth: 0.8,
    maxPx: 8,
  },
  {
    className:
      "absolute -left-6 bottom-4 h-32 w-32 rounded-full bg-[#8B5CF6]/12 blur-3xl",
    depth: 0.55,
    maxPx: 6,
  },
];

export function layersForParallaxVariant(
  variant: ParallaxDepthVariant
): ParallaxLayerDef[] {
  switch (variant) {
    case "landing-hero":
      return LANDING_HERO_LAYERS;
    case "pack-showcase":
      return PACK_SHOWCASE_LAYERS;
    case "agent-panel":
      return AGENT_PANEL_LAYERS;
    case "dashboard-studio":
    default:
      return [];
  }
}

type LayersProps = {
  variant: ParallaxDepthVariant;
  layers?: ParallaxLayerDef[];
  className?: string;
  children?: ReactNode;
  getLayerStyle: UseSubtleParallaxResult["getLayerStyle"];
  enabled: boolean;
};

/**
 * Decorative depth layers with parallax transforms.
 * Attach `containerRef` from `useSubtleParallax` on the stable parent panel (not the page shell).
 */
export function ParallaxDepthLayers({
  variant,
  layers,
  className = "",
  children,
  getLayerStyle,
  enabled,
}: LayersProps) {
  const preset = layersForParallaxVariant(variant);
  const allLayers = preset.length
    ? [...preset, ...(layers ?? [])]
    : (layers ?? []);

  if (allLayers.length === 0 && !children) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      {allLayers.map((layer, index) => (
        <div
          key={`${variant}-${index}`}
          className={layer.className}
          style={
            enabled
              ? getLayerStyle({
                  depth: layer.depth,
                  maxPx: layer.maxPx,
                } satisfies ParallaxLayerConfig)
              : undefined
          }
        />
      ))}
      {children}
    </div>
  );
}
