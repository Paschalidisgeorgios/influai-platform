"use client";

import { type ReactNode, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";
import StudioSidebar from "./StudioSidebar";
import RadialAssetMenu from "./RadialAssetMenu";
import ViralityAnalysisPanel from "./ViralityAnalysisPanel";
import MicroPaywallOverlay from "./MicroPaywallOverlay";

export default function StudioShell({ children }: { children: ReactNode }) {
  const setProfile = useUserStore((s) => s.setProfile);
  const setCredits = useUserStore((s) => s.setCredits);
  const setLoading = useUserStore((s) => s.setLoading);
  const reset = useUserStore((s) => s.reset);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session?.user) {
        reset();
        return;
      }

      setProfile({
        userId: session.user.id,
        email: session.user.email ?? null,
        displayName:
          (session.user.user_metadata?.full_name as string | undefined) ??
          session.user.email?.split("@")[0] ??
          null,
      });

      const { data: creditRow } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!cancelled) {
        setCredits(creditRow?.credits ?? 0);
        setLoading(false);
      }
    }

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void hydrate();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [reset, setCredits, setLoading, setProfile]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#050505] text-white antialiased">
      <StudioSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <RadialAssetMenu />
      <ViralityAnalysisPanel />
      <MicroPaywallOverlay />
    </div>
  );
}
