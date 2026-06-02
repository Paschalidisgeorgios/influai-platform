"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type CreativeSuiteContextValue = {
  authChecked: boolean;
  credits: number;
  creditsLoading: boolean;
  creditsError: boolean;
  creditsRefreshKey: number;
  galleryRefreshKey: number;
  charactersRefreshKey: number;
  regenerateDraft: RegenerateDraft | null;
  statusMessage: string | null;
  refreshCredits: () => void;
  refreshGallery: () => void;
  refreshCharacters: () => void;
  onGenerationQueued: (options?: {
    creditsSpent?: number;
    creditsAfter?: number | null;
  }) => void;
  setRegenerateDraft: (draft: RegenerateDraft | null) => void;
  handleRegenerate: (prompt: string, characterId: string | null) => void;
  showStatus: (message: string) => void;
  clearStatus: () => void;
};

const CreativeSuiteContext = createContext<CreativeSuiteContextValue | null>(
  null
);

export function useCreativeSuite() {
  const ctx = useContext(CreativeSuiteContext);
  if (!ctx) {
    throw new Error("useCreativeSuite must be used within CreativeSuiteProvider");
  }
  return ctx;
}

export function CreativeSuiteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const [authChecked, setAuthChecked] = useState(false);
  const [credits, setCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState(false);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [charactersRefreshKey, setCharactersRefreshKey] = useState(0);
  const [regenerateDraft, setRegenerateDraft] = useState<RegenerateDraft | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function ensureSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (!session) {
        router.replace("/login?reason=session_expired");
        return;
      }
      setAuthChecked(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login?reason=session_expired");
        return;
      }
      setAuthChecked(true);
    });

    void ensureSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const loadCredits = useCallback(async () => {
    setCreditsLoading(true);
    setCreditsError(false);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setCreditsError(true);
        return;
      }

      const res = await fetch("/api/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setCreditsError(true);
        return;
      }

      const data = await res.json();
      if (typeof data.credits !== "number") {
        setCreditsError(true);
        return;
      }

      setCredits(data.credits);
      setCreditsError(false);
    } catch (error) {
      console.error("Credits load error:", error);
      setCreditsError(true);
    } finally {
      setCreditsLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    if (!authChecked) return;
    void loadCredits();
  }, [authChecked, creditsRefreshKey, loadCredits]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const showStatus = useCallback((message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  const value = useMemo<CreativeSuiteContextValue>(
    () => ({
      authChecked,
      credits,
      creditsLoading,
      creditsError,
      creditsRefreshKey,
      galleryRefreshKey,
      charactersRefreshKey,
      regenerateDraft,
      statusMessage,
      refreshCredits: () => setCreditsRefreshKey((c) => c + 1),
      refreshGallery: () => setGalleryRefreshKey((c) => c + 1),
      refreshCharacters: () => setCharactersRefreshKey((c) => c + 1),
      onGenerationQueued: (options) => {
        if (typeof options?.creditsAfter === "number") {
          setCredits(options.creditsAfter);
        } else if (options?.creditsSpent && options.creditsSpent > 0) {
          setCredits((current) => Math.max(0, current - options.creditsSpent!));
        }
        setGalleryRefreshKey((c) => c + 1);
        setCreditsRefreshKey((c) => c + 1);
        setRegenerateDraft(null);
      },
      setRegenerateDraft,
      handleRegenerate: (prompt, characterId) => {
        setRegenerateDraft({
          prompt,
          characterId,
          source: "gallery",
          loadedAt: Date.now(),
        });
        router.push("/dashboard/image");
      },
      showStatus,
      clearStatus: () => setStatusMessage(null),
    }),
    [
      authChecked,
      credits,
      creditsLoading,
      creditsError,
      creditsRefreshKey,
      galleryRefreshKey,
      charactersRefreshKey,
      regenerateDraft,
      statusMessage,
      router,
      showStatus,
    ]
  );

  return (
    <CreativeSuiteContext.Provider value={value}>
      {children}
    </CreativeSuiteContext.Provider>
  );
}
