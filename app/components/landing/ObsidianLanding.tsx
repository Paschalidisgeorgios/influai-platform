"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import KineticHeroSection from "./KineticHeroSection";
import ProductTheatreSection from "./ProductTheatreSection";
import ModelExplorerSection from "./ModelExplorerSection";
import LandingMediaProofSection from "./LandingMediaProofSection";
import CreativeScoreSection from "./CreativeScoreSection";
import LandingCreditsSection from "./LandingCreditsSection";
import BrutalistPricingGrid from "./BrutalistPricingGrid";
import BrutalistTrustFaq from "./BrutalistTrustFaq";
import { magnificContent, type LandingLanguage } from "./magnificContent";
import ObsidianNavbar from "./obsidian/ObsidianNavbar";
import AIBackgroundField from "./AIBackgroundField";
import PricingUiProvider from "@/app/components/billing/PricingUiProvider";

/**
 * Cinematic landing — product theatre first, not a long generic SaaS scroll.
 * 1. Kinetic Hero · 2. Product Theatre · 3. Model Explorer · 4. Media proof
 * 5. Creative Score · 6. Credits + Pricing · 7. Trust FAQ + Final CTA
 */
export default function ObsidianLanding() {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [studioHref, setStudioHref] = useState("/auth?next=/dashboard");
  const supabase = createClient();
  const copy = magnificContent[currentLanguage].nav;

  function handleLanguageChange(lang: LandingLanguage) {
    setLanguage(lang);
  }

  useEffect(() => {
    let mounted = true;

    async function resolveSessionTarget() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setStudioHref(session ? "/dashboard" : "/auth?next=/dashboard");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (!mounted) return;
      setStudioHref(session ? "/dashboard" : "/auth?next=/dashboard");
    });

    void resolveSessionTarget();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <PricingUiProvider language={currentLanguage}>
      <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased selection:bg-amber-500 selection:text-black">
        <AIBackgroundField />

        <div className="relative z-10">
        <ObsidianNavbar
          currentLanguage={currentLanguage}
          setCurrentLanguage={handleLanguageChange}
          studioHref={studioHref}
          copy={copy}
        />

        <KineticHeroSection
          currentLanguage={currentLanguage}
          studioHref={studioHref}
        />

        <ProductTheatreSection
          currentLanguage={currentLanguage}
          studioHref={studioHref}
        />

        <ModelExplorerSection currentLanguage={currentLanguage} />

        <LandingMediaProofSection currentLanguage={currentLanguage} />

        <CreativeScoreSection currentLanguage={currentLanguage} />

        <LandingCreditsSection currentLanguage={currentLanguage} />

        <div id="pricing">
          <BrutalistPricingGrid currentLanguage={currentLanguage} />
        </div>

        <BrutalistTrustFaq
          currentLanguage={currentLanguage}
          studioHref={studioHref}
        />

        <footer className="border-t border-neutral-800/80 bg-[#050505]/80 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 backdrop-blur-sm">
          © {new Date().getFullYear()} InfluExAI · The Content Engine · Images,
          motion & social-ready packs
        </footer>
        </div>
      </main>
    </PricingUiProvider>
  );
}
