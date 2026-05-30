"use client";

import { useEffect, useState } from "react";
import {
  readDashboardPersonalization,
  type StoredPersonalization,
} from "@/lib/dashboard/personalization";

/**
 * Dashboard personalization scaffold — reads landing intent routing prefs.
 * Wire into ObsidianIntelligentStudio / studio pages in a follow-up pass.
 */
export function useDashboardPersonalization() {
  const [personalization, setPersonalization] = useState<StoredPersonalization>({});

  useEffect(() => {
    setPersonalization(readDashboardPersonalization());
  }, []);

  return {
    personalization,
    hasPriorIntent: Boolean(personalization.lastRecommendation),
    lastDeepLink: personalization.lastRecommendation
      ? buildDeepLinkFromStored(personalization)
      : null,
  };
}

function buildDeepLinkFromStored(stored: StoredPersonalization): string | null {
  const rec = stored.lastRecommendation;
  if (!rec) return null;
  const params = new URLSearchParams();
  params.set("engine", rec.engineId);
  if (rec.durationSeconds) params.set("duration", String(rec.durationSeconds));
  if (stored.lastPrompt) params.set("prompt", stored.lastPrompt);
  return `${rec.href}?${params.toString()}`;
}
