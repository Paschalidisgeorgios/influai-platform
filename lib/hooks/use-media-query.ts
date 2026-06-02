"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to `window.matchMedia`.
 * Returns `false` until mounted so server and first client paint match (no hydration drift).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return mounted && matches;
}