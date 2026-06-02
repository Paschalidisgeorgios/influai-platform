"use client";

import { useEffect, useState } from "react";
import {
  LANDING_SECTION_IDS,
  type LandingSectionId,
} from "@/lib/landing/landing-section-nav";

/** Highlights the section most visible in the viewport (low-risk scroll spy). */
export function useLandingSectionSpy(
  defaultSection: LandingSectionId = "workflow"
): LandingSectionId {
  const [active, setActive] = useState<LandingSectionId>(defaultSection);

  useEffect(() => {
    const elements = LANDING_SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => el != null);

    if (!elements.length) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: LandingSectionId | null = null;
        let bestRatio = 0;

        for (const id of LANDING_SECTION_IDS) {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestId && bestRatio > 0) {
          setActive(bestId);
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -52% 0px",
        threshold: [0, 0.12, 0.3, 0.5, 0.75],
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return active;
}
