"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

import CampaignFeatureGrid from "./CampaignFeatureGrid";
import CreditValueStrip from "./CreditValueStrip";
import BrutalistMarquee from "./BrutalistMarquee";
import BrutalistPricingGrid from "./BrutalistPricingGrid";
import BrutalistTrustFaq from "./BrutalistTrustFaq";
import FullWidthComparisonSlider from "./FullWidthComparisonSlider";
import ScrollZoomSection from "./ScrollZoomSection";
import VideoPreviewStudio from "./VideoPreviewStudio";
import { magnificContent, type LandingLanguage } from "./magnificContent";
import ObsidianHero from "./obsidian/ObsidianHero";
import ObsidianNavbar from "./obsidian/ObsidianNavbar";

export default function ObsidianLanding() {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [studioHref, setStudioHref] = useState("/auth");
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
      setStudioHref(session ? "/dashboard" : "/auth");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (!mounted) return;
      setStudioHref(session ? "/dashboard" : "/auth");
    });

    void resolveSessionTarget();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white antialiased selection:bg-amber-500 selection:text-black">
      <ObsidianNavbar
        currentLanguage={currentLanguage}
        setCurrentLanguage={handleLanguageChange}
        studioHref={studioHref}
        copy={copy}
      />

      <ObsidianHero currentLanguage={currentLanguage} studioHref={studioHref} />

      <ScrollZoomSection currentLanguage={currentLanguage} />

      <CampaignFeatureGrid currentLanguage={currentLanguage} />

      <VideoPreviewStudio currentLanguage={currentLanguage} />

      <FullWidthComparisonSlider currentLanguage={currentLanguage} />

      <BrutalistMarquee currentLanguage={currentLanguage} />

      <CreditValueStrip currentLanguage={currentLanguage} />

      <div id="pricing">
        <BrutalistPricingGrid currentLanguage={currentLanguage} />
      </div>

      <div id="faq">
        <BrutalistTrustFaq currentLanguage={currentLanguage} studioHref={studioHref} />
      </div>

      <footer className="border-t border-neutral-800/80 bg-[#050505] py-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
        © {new Date().getFullYear()} InfluExAI · AI Campaign Studio · Cinematic Creative Suite
      </footer>
    </main>
  );
}
