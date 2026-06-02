"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ImageIcon, Sparkles, Video } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

type StepKey = "start" | "intent" | "assist" | "teach";

type IntelligentPromptingCopy =
  (typeof magnificContent)[LandingLanguage]["intelligentPrompting"];

function StepVisual({
  stepKey,
  t,
}: {
  stepKey: StepKey;
  t: IntelligentPromptingCopy;
}) {
  const step = t.steps.find((s) => s.key === stepKey)!;

  if (stepKey === "start" && "exampleLabel" in step) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          {step.exampleLabel}
        </p>
        <p className="rounded-lg border border-dashed border-white/15 bg-[#070A12]/80 px-3 py-2.5 text-sm text-white/80">
          &ldquo;{step.body}&rdquo;
        </p>
      </div>
    );
  }

  if (stepKey === "intent" && "detectedLabel" in step) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          {step.detectedLabel}
        </p>
        <ul className="space-y-1.5">
          {step.bullets.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#111827]/60 px-2.5 py-1.5 text-xs text-white/75"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-[#22D3EE]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (stepKey === "assist" && "enhancedLabel" in step) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
          {step.enhancedLabel}
        </p>
        <p className="rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/8 px-3 py-2.5 text-xs leading-relaxed text-white/85">
          {step.body}
        </p>
      </div>
    );
  }

  if (stepKey === "teach" && "messageLabel" in step) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          {step.messageLabel}
        </p>
        <p className="rounded-lg border border-white/[0.08] bg-[#111827]/80 px-3 py-2.5 text-xs leading-relaxed text-[#9CA3AF]">
          {step.body}
        </p>
      </div>
    );
  }

  return null;
}

function PromptExampleCard({
  badge,
  icon,
  inputLabel,
  input,
  improvedLabel,
  improved,
}: {
  badge: string;
  icon: ReactNode;
  inputLabel: string;
  input: string;
  improvedLabel: string;
  improved: string;
}) {
  return (
    <article className={`${PREMIUM_CLASSES.glassCard} p-4 sm:p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-[#C4B5FD]">
          {icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-amber-400">{badge}</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            {inputLabel}
          </p>
          <p className="mt-1 rounded-lg border border-dashed border-white/12 bg-[#070A12]/60 px-3 py-2 text-sm text-white/70">
            &ldquo;{input}&rdquo;
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
            {improvedLabel}
          </p>
          <p className="mt-1 rounded-lg border border-[#8B5CF6]/20 bg-[#8B5CF6]/6 px-3 py-2 text-xs leading-relaxed text-white/85">
            {improved}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function IntelligentPromptingSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].intelligentPrompting;
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeKey = t.steps[activeStep]?.key as StepKey;

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible[0]?.target) return;
        const index = nodes.indexOf(visible[0].target as HTMLDivElement);
        if (index >= 0) setActiveStep(index);
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [currentLanguage]);

  return (
    <section
      id="intelligent-prompting"
      className={`border-t border-white/[0.06] bg-[#050505] ${LANDING_LAYOUT.section}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="max-w-3xl"
        >
          <p className={PREMIUM_CLASSES.mono}>Prompt Assist</p>
          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
            {t.headline}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">{t.subtitle}</p>
        </motion.div>

        <div className={`${LANDING_LAYOUT.afterHeaderLg} lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-8 xl:gap-10`}>
          <div className="space-y-6 lg:space-y-0">
            {t.steps.map((step, index) => (
              <div
                key={step.key}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                className={`rounded-2xl border p-5 transition-[border-color,box-shadow] sm:p-6 lg:min-h-[52vh] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:py-10 ${
                  activeStep === index
                    ? "border-[#8B5CF6]/35 bg-[#0E1220]/40 shadow-[0_0_24px_rgba(139,92,246,0.1)] lg:shadow-none"
                    : "border-white/[0.06] bg-[#111827]/30 lg:border-transparent lg:bg-transparent"
                }`}
              >
                <h3 className="text-sm font-bold text-white sm:text-base">{step.title}</h3>
                <div className="mt-4 lg:hidden">
                  <StepVisual stepKey={step.key as StepKey} t={t} />
                </div>
              </div>
            ))}
          </div>

          <div className="relative hidden lg:block">
            <div className="sticky top-24">
              <div
                className={`${PREMIUM_CLASSES.glass} ${PREMIUM_CLASSES.glowPurple} overflow-hidden p-5`}
              >
                <div className="mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" aria-hidden />
                  <span className="text-xs font-semibold text-white/80">
                    {t.steps[activeStep]?.title.replace(/^Step \d+ — /, "").replace(/^Schritt \d+ — /, "")}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    <StepVisual stepKey={activeKey} t={t} />
                  </motion.div>
                </AnimatePresence>
                <div className="mt-5 flex gap-1.5">
                  {t.steps.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i === activeStep ? "bg-[#8B5CF6]" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...OBS_SPRING, delay: 0.05 }}
          className="mt-10 border-t border-white/[0.06] pt-8 sm:mt-11 sm:pt-9"
        >
          <h3 className="text-lg font-bold text-white sm:text-xl">{t.examplesHeadline}</h3>
          <p className="mt-2 max-w-2xl text-sm text-white/60">{t.examplesSubline}</p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <PromptExampleCard
              badge={t.imageExample.badge}
              icon={<ImageIcon className="h-4 w-4" aria-hidden />}
              inputLabel={t.imageExample.inputLabel}
              input={t.imageExample.input}
              improvedLabel={t.imageExample.improvedLabel}
              improved={t.imageExample.improved}
            />
            <PromptExampleCard
              badge={t.videoExample.badge}
              icon={<Video className="h-4 w-4" aria-hidden />}
              inputLabel={t.videoExample.inputLabel}
              input={t.videoExample.input}
              improvedLabel={t.videoExample.improvedLabel}
              improved={t.videoExample.improved}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
