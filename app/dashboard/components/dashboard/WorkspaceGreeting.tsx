"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  buildGreetingHeadline,
  COPILOT_PROMPT_EXAMPLES,
  deriveWorkspaceDisplayName,
  getWorkspaceRecommendation,
  workspaceTargetPath,
  type WorkspaceRecommendation,
} from "@/lib/dashboard/workspace-intelligence";
import {
  readWorkspaceSession,
  setResumePromptFlag,
} from "@/lib/dashboard/workspace-persistence";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { PROMPT_ASSIST } from "@/lib/copy/launch-user-copy";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

export default function WorkspaceGreeting({ variant = "full" }: { variant?: "full" | "compact" }) {
  const router = useRouter();
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const { credits, creditsLoading } = useCreativeSuite();
  const supabase = createClient();

  const [userName, setUserName] = useState<string | null>(null);
  const [session, setSession] = useState(readWorkspaceSession());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(readWorkspaceSession());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      setUserName(
        deriveWorkspaceDisplayName(user.user_metadata, user.email ?? null)
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase.auth]);

  const recommendation = useMemo(
    (): WorkspaceRecommendation =>
      getWorkspaceRecommendation({
        userName,
        credits: creditsLoading ? null : credits,
        lastTool: session.lastModel ?? session.lastView ?? null,
        lastPrompt: session.lastPrompt ?? null,
        hasRecentAssets: session.hasRecentAssets,
        hasFailedGenerations: session.hasFailedGenerations,
        lastGeneratedAt: session.lastGeneratedAt ?? null,
      }),
    [userName, credits, creditsLoading, session]
  );

  const headline = buildGreetingHeadline(userName, isDe);
  const subtitle = isDe ? recommendation.subtitleDe : recommendation.subtitleEn;
  const primaryLabel = isDe
    ? recommendation.primaryActionDe
    : recommendation.primaryActionEn;
  const secondaryLabel = isDe
    ? recommendation.secondaryActionDe
    : recommendation.secondaryActionEn;

  const lastPrompt = session.lastPrompt?.trim() ?? "";
  const examples = isDe ? COPILOT_PROMPT_EXAMPLES.de : COPILOT_PROMPT_EXAMPLES.en;

  function goPrimary() {
    const path = workspaceTargetPath(recommendation.targetView);
    if (
      recommendation.intent === "continue_last_work" &&
      recommendation.targetView === "image"
    ) {
      setResumePromptFlag(true);
    }
    router.push(path);
  }

  function goSecondary() {
    const label = (secondaryLabel ?? "").toLowerCase();
    if (label.includes("asset")) {
      router.push("/dashboard/assets");
      return;
    }
    if (label.includes("neu") || label.includes("fresh") || label.includes("new")) {
      router.push("/dashboard/image");
      return;
    }
    router.push("/dashboard/image");
  }

  function resumePrompt() {
    setResumePromptFlag(true);
    router.push("/dashboard/image");
  }

  const isCompact = variant === "compact";

  if (!mounted) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto h-12 max-w-md animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={OBS_SPRING}
      className="w-full text-center"
      aria-label={isDe ? "Workspace Begrüßung" : "Workspace greeting"}
    >
      <span className="inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
        AI Creator Studio
      </span>

      <h1 className={`mt-4 font-black italic tracking-[-0.05em] text-white ${isCompact ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl"}`}>
        {headline}
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm text-white/55 md:text-base">
        {isDe ? recommendation.titleDe : recommendation.titleEn}
      </p>
      {!isCompact ? (
        <p className="mx-auto mt-2 max-w-2xl text-sm text-white/45 md:text-base">
          {subtitle}
        </p>
      ) : null}

      {!isCompact ? (
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={goPrimary}
          className="rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(245,158,11,0.35)] transition hover:bg-amber-400"
        >
          {primaryLabel}
        </button>
        {secondaryLabel ? (
          <button
            type="button"
            onClick={goSecondary}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/[0.08]"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
      ) : null}

      {!isCompact && lastPrompt ? (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            {isDe ? "Zuletzt gearbeitet an" : "Last worked on"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {lastPrompt.length > 90 ? `${lastPrompt.slice(0, 90)}…` : lastPrompt}
          </p>
          <button
            type="button"
            onClick={resumePrompt}
            className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            {isDe ? "Prompt wieder aufnehmen" : "Resume prompt"}
          </button>
        </div>
      ) : null}

      {!isCompact ? (
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
        <p className="text-sm text-white/55">
          {isDe ? PROMPT_ASSIST.tagline.de : PROMPT_ASSIST.tagline.en}
        </p>
        <p className="mt-2 text-xs text-white/45">
          {isDe ? PROMPT_ASSIST.improvedNoteImage.de : PROMPT_ASSIST.improvedNoteImage.en}
        </p>
        <p className="mt-1 text-xs text-white/40">
          {isDe ? PROMPT_ASSIST.originalIntact.de : PROMPT_ASSIST.originalIntact.en}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <span
              key={ex}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/45"
            >
              {ex}
            </span>
          ))}
        </div>
      </div>
      ) : null}
    </motion.section>
  );
}
