"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { isDevUiEnabled } from "@/lib/env/runtime-ui";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

const COPY = {
  en: {
    title: "Motion Transfer is being activated.",
    body: "This module is prepared and will unlock once the server engine is active.",
    status: "Preparing module",
    devHint:
      "Dev hint: set NEXT_PUBLIC_ENABLE_LIVE_AVATAR=true and ENABLE_LIVE_AVATAR=true, then restart dev server.",
  },
  de: {
    title: "Motion Transfer wird gerade aktiviert.",
    body: "Dieses Modul ist vorbereitet und wird freigeschaltet, sobald die Server-Engine aktiv ist.",
    status: "Modul wird vorbereitet",
    devHint:
      "Dev hint: set NEXT_PUBLIC_ENABLE_LIVE_AVATAR=true and ENABLE_LIVE_AVATAR=true, then restart dev server.",
  },
} as const;

export default function MotionTransferActivatingCard() {
  const { language } = useDashboardLanguage();
  const copy = COPY[language === "de" ? "de" : "en"];
  const showDevHint = isDevUiEnabled();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={OBS_SPRING}
      className={`mx-auto w-full max-w-lg text-center ${OBS.glassPad}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
        <Sparkles className="h-7 w-7 text-amber-400" aria-hidden />
      </div>

      <p className={`mt-6 ${OBS.mono}`}>{copy.status}</p>

      <h1 className={`mt-3 ${OBS.titleHero} text-3xl sm:text-4xl`}>{copy.title}</h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
        {copy.body}
      </p>

      <div className="mt-8 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span className={`${OBS.mono} text-neutral-500`}>
            {language === "de" ? "In Vorbereitung" : "In preparation"}
          </span>
        </span>
      </div>

      {showDevHint ? (
        <p className="mt-8 text-left text-[10px] leading-relaxed text-neutral-600">
          {copy.devHint}
        </p>
      ) : null}
    </motion.div>
  );
}
