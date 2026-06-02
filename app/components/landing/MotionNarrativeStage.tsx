"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import {
  getNarrativeStep,
  getNarrativeSteps,
  NARRATIVE_COPY_MIN_HEIGHT,
  NARRATIVE_STEP_ORDER,
  type NarrativeStepId,
} from "@/lib/landing/motion-narrative-content";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import NarrativeStepCard from "./NarrativeStepCard";
import NarrativeVisualStage from "./NarrativeVisualStage";

const AUTO_MS = 4500;

type Props = {
  language: LandingLanguage;
  activeStep?: NarrativeStepId;
  onStepChange?: (step: NarrativeStepId) => void;
  /** Auto-advance while the stage is in view */
  autoPlay?: boolean;
  /** Sidebar: copy + pills only (pack showcase is the visual) */
  layout?: "full" | "sidebar";
  className?: string;
};

export default function MotionNarrativeStage({
  language,
  activeStep: controlledStep,
  onStepChange,
  autoPlay = true,
  layout = "full",
  className = "",
}: Props) {
  const sidebar = layout === "sidebar";
  const steps = getNarrativeSteps(language);
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35, once: false });
  const [internalStep, setInternalStep] = useState<NarrativeStepId>("idea");
  const [paused, setPaused] = useState(false);

  const activeStep = controlledStep ?? internalStep;
  const activeIndex = NARRATIVE_STEP_ORDER.indexOf(activeStep);
  const activeCopy = getNarrativeStep(activeStep, language);

  const setStep = useCallback(
    (id: NarrativeStepId) => {
      if (controlledStep == null) {
        setInternalStep(id);
      }
      onStepChange?.(id);
    },
    [controlledStep, onStepChange]
  );

  useEffect(() => {
    if (!autoPlay || controlledStep != null || !inView || paused || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setInternalStep((current) => {
        const index = NARRATIVE_STEP_ORDER.indexOf(current);
        const next =
          NARRATIVE_STEP_ORDER[(index + 1) % NARRATIVE_STEP_ORDER.length]!;
        onStepChange?.(next);
        return next;
      });
    }, AUTO_MS);

    return () => window.clearInterval(timer);
  }, [autoPlay, controlledStep, inView, onStepChange, paused, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setStep("export");
    }
  }, [reduceMotion, setStep]);

  return (
    <div
      ref={rootRef}
      className={className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div
        className={
          sidebar
            ? "flex min-w-0 flex-col"
            : "grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8"
        }
      >
        <div className="flex min-w-0 flex-col">
          <div
            className="flex gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={
              language === "de" ? "Produkt-Workflow" : "Product workflow"
            }
          >
            {steps.map((step, index) => (
              <NarrativeStepCard
                key={step.id}
                stepId={step.id}
                index={index}
                label={step.label}
                active={step.id === activeStep}
                complete={index < activeIndex}
                onSelect={() => setStep(step.id)}
              />
            ))}
          </div>

          <div
            className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/[0.06]"
            aria-hidden
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500/80 to-amber-400/40"
              animate={{
                width: `${((activeIndex + 1) / NARRATIVE_STEP_ORDER.length) * 100}%`,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
            />
          </div>

          <div
            className={`mt-5 ${NARRATIVE_COPY_MIN_HEIGHT}`}
            role="tabpanel"
            id={`narrative-panel-${activeStep}`}
            aria-labelledby={`narrative-tab-${activeStep}`}
          >
            <motion.div
              key={activeStep}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={OBS_SPRING}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500/80">
                {String(activeIndex + 1).padStart(2, "0")} · {activeCopy.label}
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl">
                {activeCopy.body}
              </p>
            </motion.div>
          </div>
        </div>

        {!sidebar ? (
          <NarrativeVisualStage stepId={activeStep} language={language} />
        ) : null}
      </div>
    </div>
  );
}
