"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardLanguage } from "../../i18n";

type Language = "en" | "de";

type WelcomeVariant = {
  titleEn: (name: string) => string;
  subtitleEn: string;
  titleDe: (name: string) => string;
  subtitleDe: string;
};

const VARIANTS: WelcomeVariant[] = [
  {
    titleEn: (name) => `Welcome back, ${name}! 👋 What are you creating today?`,
    subtitleEn:
      "Let's launch your next big campaign. Your Style Profiles are ready to generate brand-consistent masterpieces.",
    titleDe: (name) => `Willkommen zurück, ${name}! Was erschaffst du heute? ✨`,
    subtitleDe:
      "Lass uns deine nächste große Kampagne starten. Deine Style-Profile stehen bereit, um markenkonforme Meisterwerke zu erschaffen.",
  },
  {
    titleEn: (name) => `Welcome back, ${name}! 👋 Ready to scale your content?`,
    subtitleEn:
      "Turn your ideas into production-ready ad assets in seconds. Just select a studio and take your brand to the next level.",
    titleDe: (name) =>
      `Willkommen zurück, ${name}! Bereit, deinen Content zu skalieren? 🚀`,
    subtitleDe:
      "Verwandle deine Ideen in Sekunden in fertige Werbe-Assets. Wähle einfach ein Studio aus und bringe deine Marke aufs nächste Level.",
  },
  {
    titleEn: (name) => `Welcome back, ${name}! 👋 Back for more visual magic?`,
    subtitleEn:
      "Set new visual standards today. Select a studio below to effortlessly generate high-end images, videos, or lip-syncs.",
    titleDe: (name) =>
      `Willkommen zurück, ${name}! Bereit für neue visuelle Magie? 🔮`,
    subtitleDe:
      "Setze noch heute neue visuelle Maßstäbe. Wähle unten ein Studio, um mühelos High-End-Bilder, Videos oder Lip-Syncs zu generieren.",
  },
];

const COLLAGE_LAYOUT = [
  "top-6 left-8 w-40 h-52 -rotate-3 opacity-80 hidden sm:block",
  "bottom-6 left-40 w-52 h-40 rotate-2 opacity-80 hidden md:block",
  "top-4 right-10 w-48 h-56 rotate-3 opacity-85",
  "bottom-4 right-44 w-44 h-44 -rotate-2 opacity-75 hidden lg:block",
  "top-14 left-1/2 w-44 h-44 -translate-x-1/2 rotate-1 opacity-70 hidden lg:block",
] as const;

export type UserWelcomeBannerProps = {
  userName?: string;
  currentLanguage?: Language | DashboardLanguage;
  recentAssets?: string[];
  className?: string;
};

export default function UserWelcomeBanner({
  userName = "Georgios",
  currentLanguage = "en",
  recentAssets = [],
  className = "",
}: UserWelcomeBannerProps) {
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    setVariantIndex(Math.floor(Math.random() * VARIANTS.length));
  }, []);

  const variant = VARIANTS[variantIndex] ?? VARIANTS[0]!;
  const isGerman = currentLanguage === "de";
  const title = isGerman ? variant.titleDe(userName) : variant.titleEn(userName);
  const subtitle = isGerman ? variant.subtitleDe : variant.subtitleEn;

  const collageSlots = useMemo(() => {
    const sources = recentAssets.filter(Boolean).slice(0, COLLAGE_LAYOUT.length);
    return COLLAGE_LAYOUT.map((layoutClass, index) => ({
      layoutClass,
      src: sources[index] ?? null,
    }));
  }, [recentAssets]);

  return (
    <section
      className={`relative h-64 overflow-hidden rounded-2xl border border-gray-200 bg-slate-950 shadow-xl md:h-72 ${className}`}
      aria-label={title}
    >
      {collageSlots.map((slot, index) =>
        slot.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${slot.src}-${index}`}
            src={slot.src}
            alt=""
            className={`absolute rounded-2xl object-cover shadow-2xl ring-1 ring-white/10 ${slot.layoutClass}`}
          />
        ) : (
          <div
            key={`placeholder-${index}`}
            aria-hidden
            className={`absolute rounded-2xl bg-gradient-to-br from-orange-500/30 via-slate-700/40 to-slate-900/60 shadow-2xl ring-1 ring-white/10 ${slot.layoutClass}`}
          />
        )
      )}

      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-slate-900/60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_55%)]"
        aria-hidden
      />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="mb-2 max-w-3xl text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm font-medium text-white/90 drop-shadow-sm sm:text-base">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
