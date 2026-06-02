"use client";

import { motion } from "framer-motion";
import { Video } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CreateMotionVideoSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].createMotionVideo;

  return (
    <section
      id="create-motion-video"
      className={`border-t border-white/[0.06] bg-[#070A12] ${LANDING_LAYOUT.section}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`grid lg:grid-cols-2 lg:items-start ${LANDING_LAYOUT.gridWide}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={OBS_SPRING}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22D3EE]/10 text-[#67E8F9]">
                <Video className="h-4 w-4" aria-hidden />
              </span>
              <p className={PREMIUM_CLASSES.mono}>{t.eyebrow}</p>
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
              {t.headline}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/65">{t.body}</p>
            <p className="mt-4 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              {t.creditLabel}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-white/45">{t.availabilityNote}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...OBS_SPRING, delay: 0.08 }}
            className={`${PREMIUM_CLASSES.glass} p-5 sm:p-6`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              {t.presetsLabel}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {t.presets.map((preset) => (
                <li
                  key={preset}
                  className="rounded-full border border-white/[0.1] bg-[#111827]/80 px-3 py-1.5 text-xs font-medium text-white/80"
                >
                  {preset}
                </li>
              ))}
            </ul>
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0E1220]">
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <Video className="h-8 w-8 text-[#8B5CF6]/50" aria-hidden />
                <p className="text-xs text-white/40">
                  {currentLanguage === "de"
                    ? "Beschreibe Bewegung, Kamera und Stimmung in deinem Prompt."
                    : "Describe motion, camera and mood in your prompt."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
