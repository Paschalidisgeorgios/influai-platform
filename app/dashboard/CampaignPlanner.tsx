"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clapperboard,
  Copy,
  Film,
  Hash,
  ImageIcon,
  ListOrdered,
  Lock,
  Megaphone,
  Send,
  Sparkles,
} from "lucide-react";
import { useDashboardLanguage } from "./DashboardLanguageProvider";

export type CampaignPlan = {
  campaignAngle: string;
  contentSet: {
    stories: [string, string, string];
    feedPosts: [string, string];
    reelIdea: string;
  };
  shots: Array<{
    title: string;
    visualDirection: string;
    imagePrompt: string;
    videoMotionPrompt: string;
    format: string;
  }>;
  captions: [string, string, string];
  hashtags: string[];
};

type CampaignPlannerProps = {
  onUsePromptInAgent: (prompt: string) => void;
};

type PlatformKey = "instagram" | "tiktok" | "youtube" | "linkedin" | "multi";
type GoalKey = "awareness" | "engagement" | "conversion" | "launch";

function formatTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function resolvePrimaryFormat(
  platform: PlatformKey,
  labels: Record<PlatformKey, string>
): string {
  return labels[platform] ?? labels.multi;
}

function buildCampaignPlan(
  idea: string,
  brand: string,
  platform: PlatformKey,
  goal: GoalKey,
  copy: ReturnType<typeof useDashboardLanguage>["copy"]
): CampaignPlan {
  const t = copy.campaignPlanner.templates;
  const brandLabel = brand.trim() || copy.campaignPlanner.defaults.brandFallback;
  const ideaLabel = idea.trim() || copy.campaignPlanner.defaults.ideaFallback;
  const vars = {
    brand: brandLabel,
    idea: ideaLabel,
    platform: copy.campaignPlanner.platforms[platform],
    goal: copy.campaignPlanner.goals[goal],
  };

  const angleKey =
    goal === "conversion"
      ? "angleConversion"
      : goal === "engagement"
        ? "angleEngagement"
        : goal === "launch"
          ? "angleLaunch"
          : "angleAwareness";

  const campaignAngle = formatTemplate(t[angleKey], vars);

  const stories: [string, string, string] = [
    formatTemplate(t.story1, vars),
    formatTemplate(t.story2, vars),
    formatTemplate(t.story3, vars),
  ];

  const feedPosts: [string, string] = [
    formatTemplate(t.feed1, vars),
    formatTemplate(t.feed2, vars),
  ];

  const reelIdea = formatTemplate(t.reelIdea, vars);

  const primaryFormat = resolvePrimaryFormat(
    platform,
    copy.campaignPlanner.formats
  );
  const verticalFormat = copy.campaignPlanner.formats.tiktok;
  const wideFormat = copy.campaignPlanner.formats.youtube;

  const shots = [
    {
      title: formatTemplate(t.shot1Title, vars),
      visualDirection: formatTemplate(t.shot1Direction, vars),
      imagePrompt: formatTemplate(t.shot1ImagePrompt, vars),
      videoMotionPrompt: formatTemplate(t.shot1VideoPrompt, vars),
      format: primaryFormat,
    },
    {
      title: formatTemplate(t.shot2Title, vars),
      visualDirection: formatTemplate(t.shot2Direction, vars),
      imagePrompt: formatTemplate(t.shot2ImagePrompt, vars),
      videoMotionPrompt: formatTemplate(t.shot2VideoPrompt, vars),
      format: primaryFormat,
    },
    {
      title: formatTemplate(t.shot3Title, vars),
      visualDirection: formatTemplate(t.shot3Direction, vars),
      imagePrompt: formatTemplate(t.shot3ImagePrompt, vars),
      videoMotionPrompt: formatTemplate(t.shot3VideoPrompt, vars),
      format: verticalFormat,
    },
    {
      title: formatTemplate(t.shot4Title, vars),
      visualDirection: formatTemplate(t.shot4Direction, vars),
      imagePrompt: formatTemplate(t.shot4ImagePrompt, vars),
      videoMotionPrompt: formatTemplate(t.shot4VideoPrompt, vars),
      format: wideFormat,
    },
    {
      title: formatTemplate(t.shot5Title, vars),
      visualDirection: formatTemplate(t.shot5Direction, vars),
      imagePrompt: formatTemplate(t.shot5ImagePrompt, vars),
      videoMotionPrompt: formatTemplate(t.shot5VideoPrompt, vars),
      format: primaryFormat,
    },
  ];

  const captions: [string, string, string] = [
    formatTemplate(t.caption1, vars),
    formatTemplate(t.caption2, vars),
    formatTemplate(t.caption3, vars),
  ];

  const hashtags = copy.campaignPlanner.hashtagSeeds.map((tag) =>
    tag.replace("{brand}", brandLabel.replace(/\s+/g, ""))
  );

  return {
    campaignAngle,
    contentSet: { stories, feedPosts, reelIdea },
    shots,
    captions,
    hashtags,
  };
}

function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-bold text-white/55 transition hover:border-white/20 hover:text-white"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-300" aria-hidden />
      ) : (
        <Copy className="h-3 w-3" aria-hidden />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}

export default function CampaignPlanner({
  onUsePromptInAgent,
}: CampaignPlannerProps) {
  const { copy } = useDashboardLanguage();
  const p = copy.campaignPlanner;

  const [campaignIdea, setCampaignIdea] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [platformFocus, setPlatformFocus] = useState<PlatformKey>("instagram");
  const [goal, setGoal] = useState<GoalKey>("awareness");
  const [plan, setPlan] = useState<CampaignPlan | null>(null);

  const canGenerate = campaignIdea.trim().length >= 8;

  const platformOptions = useMemo(
    () =>
      (
        [
          "instagram",
          "tiktok",
          "youtube",
          "linkedin",
          "multi",
        ] as const
      ).map((key) => ({
        key,
        label: p.platforms[key],
      })),
    [p]
  );

  const goalOptions = useMemo(
    () =>
      (["awareness", "engagement", "conversion", "launch"] as const).map(
        (key) => ({
          key,
          label: p.goals[key],
        })
      ),
    [p]
  );

  function handleGenerate() {
    if (!canGenerate) return;

    setPlan(
      buildCampaignPlan(
        campaignIdea,
        productBrand,
        platformFocus,
        goal,
        copy
      )
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-100">
          {p.badges.planningBeta}
        </span>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">
          {p.badges.noCredits}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
          {p.badges.manualRequired}
        </span>
      </div>

      <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200">
            <Clapperboard className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-black text-white">{p.subtitle}</p>
            <p className="mt-1 text-xs leading-5 text-white/40">{p.intro}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="campaign-idea"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40"
            >
              {p.fields.campaignIdea}
            </label>
            <textarea
              id="campaign-idea"
              value={campaignIdea}
              onChange={(event) => setCampaignIdea(event.target.value)}
              rows={4}
              placeholder={p.placeholders.campaignIdea}
              className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="product-brand"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40"
            >
              {p.fields.productBrand}
            </label>
            <input
              id="product-brand"
              type="text"
              value={productBrand}
              onChange={(event) => setProductBrand(event.target.value)}
              placeholder={p.placeholders.productBrand}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="platform-focus"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40"
            >
              {p.fields.platformFocus}
            </label>
            <select
              id="platform-focus"
              value={platformFocus}
              onChange={(event) =>
                setPlatformFocus(event.target.value as PlatformKey)
              }
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            >
              {platformOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="campaign-goal"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40"
            >
              {p.fields.goal}
            </label>
            <select
              id="campaign-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value as GoalKey)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            >
              {goalOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-white/35">{p.planningPreviewNote}</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {p.generatePlan}
          </button>
        </div>
      </div>

      {plan ? (
        <div className="space-y-4 sm:space-y-5">
          <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#d8ad5f]" aria-hidden />
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white/70">
                {p.sections.campaignAngle}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {plan.campaignAngle}
            </p>
          </section>

          <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-[#d8ad5f]" aria-hidden />
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white/70">
                {p.sections.contentSet}
              </h3>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  {p.contentSet.stories}
                </p>
                <ul className="mt-2 space-y-2">
                  {plan.contentSet.stories.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2 text-xs leading-5 text-white/55"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  {p.contentSet.feedPosts}
                </p>
                <ul className="mt-2 space-y-2">
                  {plan.contentSet.feedPosts.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2 text-xs leading-5 text-white/55"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  {p.contentSet.reel}
                </p>
                <p className="mt-2 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2 text-xs leading-5 text-white/55">
                  {plan.contentSet.reelIdea}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-[#d8ad5f]" aria-hidden />
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white/70">
                {p.sections.shotList}
              </h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {plan.shots.map((shot, index) => (
                <article
                  key={index}
                  className="flex flex-col rounded-xl border border-white/[0.08] bg-black/30 p-3 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black text-white">{shot.title}</p>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold text-white/45">
                      {shot.format}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/45">
                    {shot.visualDirection}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                        {p.shotCard.imagePrompt}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-white/55">
                        {shot.imagePrompt}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                        {p.shotCard.videoMotion}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-white/55">
                        {shot.videoMotionPrompt}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyButton
                      value={shot.imagePrompt}
                      label={p.actions.copyPrompt}
                      copiedLabel={p.actions.copied}
                    />
                    <button
                      type="button"
                      onClick={() => onUsePromptInAgent(shot.imagePrompt)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-bold text-violet-100 transition hover:bg-violet-500/20"
                    >
                      <Send className="h-3 w-3" aria-hidden />
                      {p.actions.useInAgent}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#d8ad5f]" aria-hidden />
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white/70">
                {p.sections.captions}
              </h3>
            </div>
            <ul className="mt-4 space-y-3">
              {plan.captions.map((caption, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-white/[0.06] bg-black/25 p-3"
                >
                  <p className="text-sm leading-6 text-white/60">{caption}</p>
                  <div className="mt-2">
                    <CopyButton
                      value={caption}
                      label={p.actions.copyCaption}
                      copiedLabel={p.actions.copied}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
              {p.sections.hashtags}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {plan.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2">
              <CopyButton
                value={plan.hashtags.join(" ")}
                label={p.actions.copyHashtags}
                copiedLabel={p.actions.copied}
              />
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-violet-500/15 bg-violet-500/[0.06] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-violet-200" aria-hidden />
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-violet-100/90">
                {p.sections.nextSteps}
              </h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-white/50">
              {p.nextSteps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-violet-300/80">—</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onUsePromptInAgent(plan.shots[0]?.imagePrompt ?? campaignIdea)
                }
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-4 py-2.5 text-xs font-black text-violet-100 transition hover:bg-violet-500/25"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                {p.actions.useInAgent}
              </button>
              <button
                type="button"
                disabled
                title={p.actions.generateFullCampaignHint}
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-white/35"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {p.actions.generateFullCampaign}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
