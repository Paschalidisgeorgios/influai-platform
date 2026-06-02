"use client";

import Link from "next/link";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePackMotion } from "./use-pack-motion";
import { OBS_BTN, obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
  language: "en" | "de";
  label: string;
  packReady: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "badge";
  className?: string;
};

export default function PackExportCTA({
  language,
  label,
  packReady,
  loading = false,
  href,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}: Props) {
  const { reduceMotion, exportGlow } = usePackMotion();
  const isDe = language === "de";
  const isReady = packReady && !disabled && !loading;

  if (variant === "badge") {
    if (!packReady) return null;
    return (
      <motion.span
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={`${OBS_BTN.badgePreview} gap-1.5 border-amber-500/25 text-amber-300/90 shadow-[0_0_12px_rgba(245,158,11,0.12)] ${className}`}
      >
        <Download className="h-3 w-3" aria-hidden />
        {label}
      </motion.span>
    );
  }

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : null}
      {label}
      {!loading ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
    </>
  );

  const baseClass = obsidianButtonClass(isReady ? "primary" : "locked", {
    size: "md",
    fullWidth: true,
    className: `relative z-[1] sm:min-h-0 ${className}`,
  });

  const buttonInner =
    href && isReady ? (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading || !packReady}
        title={
          !packReady
            ? isDe
              ? "Pack noch nicht bereit"
              : "Pack not ready yet"
            : undefined
        }
        className={baseClass}
      >
        {content}
      </button>
    );

  if (!isReady) {
    return buttonInner;
  }

  return (
    <motion.div className="w-full rounded-xl" {...exportGlow}>
      {buttonInner}
    </motion.div>
  );
}
