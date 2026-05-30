"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

import VideoPreviewStudio from "./VideoPreviewStudio";
import BrutalistMarquee from "./BrutalistMarquee";
import BrutalistPricingGrid from "./BrutalistPricingGrid";
import BrutalistTrustFaq from "./BrutalistTrustFaq";
import FullWidthComparisonSlider from "./FullWidthComparisonSlider";
import MagnificHero from "./MagnificHero";
import MagnificNavbar from "./MagnificNavbar";
import ScrollZoomSection from "./ScrollZoomSection";
import { magnificContent, type LandingLanguage } from "./magnificContent";

type Props = {
  bodyFontClass: string;
};

function AiinflugenLandingContent({ bodyFontClass }: Props) {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [studioHref, setStudioHref] = useState("/login");
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
      setStudioHref(session ? "/dashboard" : "/login");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (!mounted) return;
      setStudioHref(session ? "/dashboard" : "/login");
    });

    void resolveSessionTarget();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <main
      className={`${bodyFontClass} relative min-h-screen bg-neutral-950 text-white antialiased selection:bg-amber-500 selection:text-black`}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black" />
      <div className="relative">
      <MagnificNavbar
        currentLanguage={currentLanguage}
        setCurrentLanguage={handleLanguageChange}
        studioHref={studioHref}
        copy={copy}
      />

      <MagnificHero currentLanguage={currentLanguage} studioHref={studioHref} />

      <ScrollZoomSection currentLanguage={currentLanguage} />

      <VideoPreviewStudio currentLanguage={currentLanguage} />

      <FullWidthComparisonSlider currentLanguage={currentLanguage} />

      <BrutalistMarquee currentLanguage={currentLanguage} />

      <BrutalistPricingGrid currentLanguage={currentLanguage} />

      <BrutalistTrustFaq
        currentLanguage={currentLanguage}
        studioHref={studioHref}
      />

      <footer className="border-t border-neutral-800 bg-black py-8 text-center text-xs font-black uppercase tracking-widest text-neutral-600">
        © {new Date().getFullYear()} InfluExAi · Cinematic Campaign Control Layer
      </footer>
      </div>
    </main>
  );
}

export default function AiinflugenLanding(props: Props) {
  return <AiinflugenLandingContent {...props} />;
}
