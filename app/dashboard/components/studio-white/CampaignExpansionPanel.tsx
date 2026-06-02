"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Check, Copy, Loader2, Sparkles, Video, Mic, UserRound } from "lucide-react";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import type { CampaignExpansionData } from "@/lib/dashboard/workspace-types";
import {
  CAMPAIGN_UPGRADE_COSTS,
  CAMPAIGN_UPGRADE_DISABLED,
  canRunUpgrade,
  type CampaignUpgradeAction,
} from "@/lib/intelligence/campaign-upgrade-config";

type Props = {
  expansion: CampaignExpansionData | null;
  warning?: string;
  imageUrl: string;
  generationId?: string;
  credits: number | null;
  isDe: boolean;
  onUpgrade: (action: CampaignUpgradeAction) => Promise<void>;
};

function CopyButton({
  text,
  label,
  isDe,
}: {
  text: string;
  label: string;
  isDe: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={isDe ? `${label} kopieren` : `Copy ${label}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-700/80 bg-neutral-950/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 transition hover:border-amber-500/40 hover:text-amber-400"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? (isDe ? "Kopiert" : "Copied") : isDe ? "Kopieren" : "Copy"}
    </button>
  );
}

type UpgradeCardProps = {
  icon: ReactNode;
  title: string;
  costLabel: string;
  disabled: boolean;
  disabledHint?: string;
  loading?: boolean;
  onClick: () => void;
};

function UpgradeCard({
  icon,
  title,
  costLabel,
  disabled,
  disabledHint,
  loading,
  onClick,
}: UpgradeCardProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-2 rounded-2xl border border-white/[0.08] p-4 text-left transition-[box-shadow] ${
        disabled
          ? "cursor-not-allowed bg-neutral-950/30 opacity-60"
          : "bg-neutral-950/50 hover:ring-1 hover:ring-amber-500/35 hover:shadow-[0_0_16px_rgba(245,158,11,0.08)]"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-amber-500/90">{icon}</span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        ) : null}
      </div>
      <span className="text-sm font-semibold text-white/90">{title}</span>
      <span className={`${OBS.mono} text-amber-500/70`}>{costLabel}</span>
      {disabled && disabledHint ? (
        <span className="text-xs leading-relaxed text-neutral-500">{disabledHint}</span>
      ) : null}
    </button>
  );
}

export default function CampaignExpansionPanel({
  expansion,
  warning,
  imageUrl,
  generationId,
  credits,
  isDe,
  onUpgrade,
}: Props) {
  const [upgradeLoading, setUpgradeLoading] = useState<CampaignUpgradeAction | null>(
    null
  );

  const handleUpgradeClick = async (action: CampaignUpgradeAction) => {
    const cost = CAMPAIGN_UPGRADE_COSTS[action];
    if (!canRunUpgrade(cost, credits)) {
      await onUpgrade(action);
      return;
    }
    setUpgradeLoading(action);
    try {
      await onUpgrade(action);
    } finally {
      setUpgradeLoading(null);
    }
  };

  const upgradesSectionTitle = isDe ? "Creator-Erweiterungen" : "Creator Upgrades";
  const expansionTitle = isDe ? "Kreative Erweiterung" : "Creative Expansion";
  const hooksTitle = isDe ? "Hooks" : "Hooks";
  const scriptTitle = isDe ? "15-Sekunden Video-Script" : "15-second video script";
  const hashtagsTitle = "Hashtags";
  const disabledHint = isDe ? "Demnächst verfügbar." : "Coming soon.";

  const upgradeCards: {
    action: CampaignUpgradeAction;
    icon: ReactNode;
    title: string;
    costLabel: string;
  }[] = [
    {
      action: "animate_script",
      icon: <Video className="h-4 w-4" />,
      title: isDe ? "Dieses Script animieren" : "Animate this script",
      costLabel: isDe ? "Kostet 25 Credits" : "Costs 25 Credits",
    },
    {
      action: "voiceover_script",
      icon: <Mic className="h-4 w-4" />,
      title: isDe
        ? "AI-Voice-Over zum Script hinzufügen"
        : "Attach AI Voice-Over to Script",
      costLabel: isDe ? "Kostet 10 Credits" : "Costs 10 Credits",
    },
    {
      action: "avatar_lipsync_motion",
      icon: <UserRound className="h-4 w-4" />,
      title: isDe
        ? "Avatar-Lippen mit Motion Video synchronisieren"
        : "Sync Avatar Lips with Motion Video",
      costLabel: isDe ? "Kostet 30 Credits" : "Costs 30 Credits",
    },
  ];

  if (!expansion && !warning) return null;

  const hashtagsText = expansion?.hashtags.join(" ") ?? "";

  return (
    <div className="mx-auto mt-6 w-full max-w-4xl space-y-6">
      <div
        className={`${OBS.glassPad} border-amber-500/10`}
        aria-label={expansionTitle}
      >
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className={`${OBS.mono} text-amber-500/80`}>{expansionTitle}</h3>
        </div>

        {warning && !expansion ? (
          <p className="text-sm text-neutral-400">{warning}</p>
        ) : null}

        {expansion ? (
          <div className="space-y-5">
            <div>
              <p className={`${OBS.mono} mb-3 text-neutral-500`}>{hooksTitle}</p>
              <ul className="space-y-2">
                {expansion.viral_hooks.map((hook, i) => (
                  <li
                    key={`hook-${i}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800/60 bg-neutral-950/40 px-3 py-2.5"
                  >
                    <span className="text-sm leading-relaxed text-neutral-200">{hook}</span>
                    <CopyButton text={hook} label={`Hook ${i + 1}`} isDe={isDe} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className={`${OBS.mono} text-neutral-500`}>{scriptTitle}</p>
                <CopyButton text={expansion.video_script} label="Script" isDe={isDe} />
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-3 text-sm leading-relaxed text-neutral-300">
                {expansion.video_script}
              </pre>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className={`${OBS.mono} text-neutral-500`}>{hashtagsTitle}</p>
                <CopyButton text={hashtagsText} label="Hashtags" isDe={isDe} />
              </div>
              <div className="flex flex-wrap gap-2">
                {expansion.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs font-medium text-amber-400/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {warning ? (
              <p className="text-xs text-neutral-500">{warning}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {expansion ? (
        <div>
          <h3 className={`${OBS.mono} mb-3 text-neutral-500`}>{upgradesSectionTitle}</h3>
          <p className="mb-4 text-xs leading-relaxed text-neutral-500">
            {isDe
              ? "Erweitere dein Bild mit Hooks, Script, Video-Optionen und weiteren Creator-Formaten."
              : "Expand your image with hooks, scripts, video options and additional creator formats."}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {upgradeCards.map((card) => {
              const disabled = CAMPAIGN_UPGRADE_DISABLED[card.action];
              return (
                <UpgradeCard
                  key={card.action}
                  icon={card.icon}
                  title={card.title}
                  costLabel={card.costLabel}
                  disabled={disabled}
                  disabledHint={disabled ? disabledHint : undefined}
                  loading={upgradeLoading === card.action}
                  onClick={() => void handleUpgradeClick(card.action)}
                />
              );
            })}
          </div>
          {!generationId || !imageUrl ? null : (
            <p className="sr-only" aria-hidden>
              {generationId}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
