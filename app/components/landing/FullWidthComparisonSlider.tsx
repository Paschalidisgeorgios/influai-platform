"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import {
  LANDING_COMPARE_MASTER,
  LANDING_COMPARE_MASTER_FALLBACK,
} from "./landingAssets";

const SYMMETRY_CLASS = "object-contain object-center mx-auto";

export default function FullWidthComparisonSlider({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].comparison;
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [masterSrc, setMasterSrc] = useState(LANDING_COMPARE_MASTER);

  useEffect(() => {
    const img = new window.Image();
    img.onerror = () => setMasterSrc(LANDING_COMPARE_MASTER_FALLBACK);
    img.src = LANDING_COMPARE_MASTER;
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, pct)));
  }, []);

  return (
    <section className="w-full bg-neutral-950 py-16 sm:py-20">
      <div className="mx-auto mb-8 max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
          {t.headline}
        </h2>
        <p className="mt-1 text-xs text-neutral-400">{t.subtitle}</p>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-[70vh] w-screen max-w-[100vw] touch-none select-none overflow-hidden bg-black"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
        onMouseMove={(e) => updatePosition(e.clientX)}
        onTouchMove={(e) => {
          const x = e.touches[0]?.clientX;
          if (x != null) updatePosition(x);
        }}
      >
        <div className="absolute inset-0">
          <Image
            src={masterSrc}
            alt={t.beforeLabel}
            fill
            className={`absolute inset-0 h-full w-full ${SYMMETRY_CLASS} blur-[1px] brightness-95`}
            sizes="100vw"
            draggable={false}
            unoptimized
          />
          <p className="pointer-events-none absolute bottom-6 left-6 z-10 rounded-md border border-neutral-700 bg-black/80 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-300">
            {t.beforeLabel}
          </p>
        </div>

        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)`,
          }}
        >
          <Image
            src={masterSrc}
            alt={t.afterLabel}
            fill
            className={`absolute inset-0 h-full w-full ${SYMMETRY_CLASS}`}
            sizes="100vw"
            draggable={false}
            unoptimized
          />
          <p className="pointer-events-none absolute bottom-6 right-6 z-10 rounded-md border border-white/30 bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-black">
            {t.afterLabel}
          </p>
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-0 top-0 z-30 w-[2px] bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
          style={{ left: `${position}%` }}
        />
        <motion.div
          className="pointer-events-none absolute z-30 h-8 w-8 -translate-x-1/2 rounded-full border border-black bg-white shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          style={{ left: `${position}%`, top: "50%", marginTop: "-16px" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <p className="max-w-4xl font-mono text-sm leading-relaxed text-neutral-400 md:text-base">
          {t.body}
        </p>
      </div>
    </section>
  );
}
