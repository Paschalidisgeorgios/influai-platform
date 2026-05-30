"use client";

import { useEffect, useState } from "react";
import {
  detectHeroLayoutViewport,
  resolveHeroMediaLayout,
  type HeroMediaLayoutBreakpoint,
  type HeroLayoutViewport,
} from "../heroMediaLayout";

export function useHeroMediaLayout(): HeroMediaLayoutBreakpoint & { viewport: HeroLayoutViewport } {
  const [viewport, setViewport] = useState<HeroLayoutViewport>("desktop");

  useEffect(() => {
    const update = () => setViewport(detectHeroLayoutViewport(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { ...resolveHeroMediaLayout(viewport), viewport };
}
