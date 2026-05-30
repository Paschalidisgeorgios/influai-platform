/** Hero backdrop framing — scale and offset per breakpoint (object-position → mediaFocalPoints.ts) */

export type HeroMediaLayoutBreakpoint = {
  scale: number;
  translateX: number;
  translateY: number;
};

export const HERO_MEDIA_LAYOUT = {
  desktop: {
    scale: 0.92,
    translateX: 40,
    translateY: 10,
  },
  tablet: {
    scale: 0.96,
    translateX: 20,
    translateY: 0,
  },
  mobile: {
    scale: 1.02,
    translateX: 0,
    translateY: 0,
  },
} as const satisfies Record<string, HeroMediaLayoutBreakpoint>;

export type HeroLayoutViewport = keyof typeof HERO_MEDIA_LAYOUT;

export function resolveHeroMediaLayout(viewport: HeroLayoutViewport): HeroMediaLayoutBreakpoint {
  return HERO_MEDIA_LAYOUT[viewport];
}

export function detectHeroLayoutViewport(width: number): HeroLayoutViewport {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
