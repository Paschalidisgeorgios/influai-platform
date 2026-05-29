"use client";

import { useEffect, useMemo, useState } from "react";

const COLLAGE_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80",
  "https://images.unsplash.com/photo-1579783902618-a3fb39279bda?w=600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
];

const HERO_VARIANTS = [
  {
    en: {
      title: "Create campaign-ready visuals",
      subtitle:
        "Turn ideas into professional assets for social media, ads and product campaigns.",
    },
    de: {
      title: "Erstelle kampagnenfähige Visuals",
      subtitle:
        "Verwandle Ideen in professionelle Assets für Social Media, Ads und Produktkampagnen.",
    },
  },
  {
    en: {
      title: "Ship creator campaigns faster",
      subtitle:
        "Flux, Kling, Runway and Seedance pipelines — unified in one clean studio.",
    },
    de: {
      title: "Creator-Kampagnen schneller liefern",
      subtitle:
        "Flux, Kling, Runway und Seedance Pipelines — vereint in einem sauberen Studio.",
    },
  },
  {
    en: {
      title: "Professional assets, one workspace",
      subtitle:
        "Image, video, lip-sync and motion transfer — built for agencies and brands.",
    },
    de: {
      title: "Professionelle Assets, ein Workspace",
      subtitle:
        "Bild, Video, Lip-Sync und Motion Transfer — für Agenturen und Marken.",
    },
  },
] as const;

type HeroBannerProps = {
  language: "de" | "en";
};

export default function HeroBanner({ language }: HeroBannerProps) {
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    setVariantIndex(Math.floor(Math.random() * HERO_VARIANTS.length));
  }, []);

  const copy = useMemo(
    () => HERO_VARIANTS[variantIndex]![language],
    [variantIndex, language]
  );

  return (
    <div className="relative mb-8 h-64 overflow-hidden rounded-2xl border border-gray-200 bg-slate-900 shadow-sm">
      <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3 opacity-90">
        {COLLAGE_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`overflow-hidden rounded-xl shadow-lg ${
              i === 0 ? "col-span-2 row-span-2 rotate-[-2deg]" : "rotate-[1deg]"
            }`}
            style={{
              gridColumn: i === 0 ? "span 2" : undefined,
              gridRow: i === 0 ? "span 2" : undefined,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-900/30" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h2
          className="max-w-xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
        >
          {copy.title}
        </h2>
        <p
          className="mt-3 max-w-lg text-sm font-medium text-white/90 sm:text-base"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
        >
          {copy.subtitle}
        </p>
      </div>
    </div>
  );
}
