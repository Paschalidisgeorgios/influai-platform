"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
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
  onUsePrompt?: (prompt: string) => void;
};

const CREDIT_PER_IMAGE = 1;
const CREDIT_PER_REEL_VIDEO = 25;

type EstimateLineItem = {
  id: string;
  label: string;
  count: number;
  creditsPerUnit: number;
  subtotal: number;
  isFutureEstimate?: boolean;
};

type CampaignEstimate = {
  storyCount: number;
  feedCount: number;
  reelCount: number;
  shotCount: number;
  lineItems: EstimateLineItem[];
  totalCredits: number;
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

function computeCampaignEstimate(
  plan: CampaignPlan,
  labels: {
    stories: string;
    feedPosts: string;
    reel: string;
    shots: string;
  }
): CampaignEstimate {
  const storyCount = plan.contentSet.stories.length;
  const feedCount = plan.contentSet.feedPosts.length;
  const reelCount = 1;
  const shotCount = plan.shots.length;

  const lineItems: EstimateLineItem[] = [
    {
      id: "stories",
      label: labels.stories,
      count: storyCount,
      creditsPerUnit: CREDIT_PER_IMAGE,
      subtotal: storyCount * CREDIT_PER_IMAGE,
    },
    {
      id: "feed",
      label: labels.feedPosts,
      count: feedCount,
      creditsPerUnit: CREDIT_PER_IMAGE,
      subtotal: feedCount * CREDIT_PER_IMAGE,
    },
    {
      id: "reel",
      label: labels.reel,
      count: reelCount,
      creditsPerUnit: CREDIT_PER_REEL_VIDEO,
      subtotal: reelCount * CREDIT_PER_REEL_VIDEO,
      isFutureEstimate: true,
    },
    {
      id: "shots",
      label: labels.shots,
      count: shotCount,
      creditsPerUnit: CREDIT_PER_IMAGE,
      subtotal: shotCount * CREDIT_PER_IMAGE,
    },
  ];

  const totalCredits = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    storyCount,
    feedCount,
    reelCount,
    shotCount,
    lineItems,
    totalCredits,
  };
}

function formatCreditsPerUnit(
  count: number,
  credits: number,
  singular: string,
  plural: string
) {
  const template = count === 1 ? singular : plural;
  return template
    .replace("{count}", String(count))
    .replace("{credits}", String(credits));
}

function CampaignEstimateCard({
  estimate,
  copy,
}: {
  estimate: CampaignEstimate;
  copy: ReturnType<typeof useDashboardLanguage>["copy"]["campaignPlanner"];
}) {
  const e = copy.estimate;

  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-[#d8ad5f]/20 bg-[linear-gradient(165deg,rgba(216,173,95,0.08)_0%,rgba(0,0,0,0.35)_45%)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
            <Calculator className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#d8ad5f]">
              {e.title}
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-white/40">{e.intro}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-violet-100">
            {copy.badges.planningBeta}
          </span>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-200">
            {copy.badges.noCredits}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
            {copy.badges.batchPlanned}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: e.counts.storyIdeas, value: estimate.storyCount },
          { label: e.counts.feedPosts, value: estimate.feedCount },
          { label: e.counts.reelShort, value: estimate.reelCount },
          { label: e.counts.shotCards, value: estimate.shotCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/35">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/25">
        <div className="border-b border-white/10 px-3 py-2 sm:px-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            {e.estimatedCredits}
          </p>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {estimate.lineItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white/75">{item.label}</p>
                <p className="text-[10px] text-white/35">
                  {formatCreditsPerUnit(
                    item.count,
                    item.creditsPerUnit,
                    e.creditsPerUnit,
                    e.creditsPerUnitPlural
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.isFutureEstimate ? (
                  <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-sky-100">
                    {e.futureEstimate}
                  </span>
                ) : null}
                <span className="text-sm font-black text-[#d8ad5f]">
                  {item.subtotal}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-3 py-3 sm:px-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
            {e.totalEstimated}
          </p>
          <p className="text-xl font-black text-[#d8ad5f]">
            {estimate.totalCredits}{" "}
            <span className="text-xs font-bold text-white/40">Credits</span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-white/45">{e.batchNote}</p>
    </section>
  );
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
  onUsePrompt,
}: CampaignPlannerProps) {
  const { copy } = useDashboardLanguage();
  const p = copy.campaignPlanner;

  const [campaignIdea, setCampaignIdea] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [platformFocus, setPlatformFocus] = useState<PlatformKey>("instagram");
  const [goal, setGoal] = useState<GoalKey>("awareness");
  const [plan, setPlan] = useState<CampaignPlan | null>(null);

  const canGenerate = campaignIdea.trim().length >= 8;

  const campaignEstimate = useMemo(() => {
    if (!plan) return null;

    return computeCampaignEstimate(plan, {
      stories: p.estimate.lineItems.stories,
      feedPosts: p.estimate.lineItems.feedPosts,
      reel: p.estimate.lineItems.reel,
      shots: p.estimate.lineItems.shots,
    });
  }, [plan, p.estimate.lineItems]);

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
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
          {p.badges.batchPlanned}
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

          {campaignEstimate ? (
            <CampaignEstimateCard estimate={campaignEstimate} copy={p} />
          ) : null}

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
                    {onUsePrompt ? (
                      <button
                        type="button"
                        onClick={() => onUsePrompt(shot.imagePrompt)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-bold text-violet-100 transition hover:bg-violet-500/20"
                      >
                        <Send className="h-3 w-3" aria-hidden />
                        {p.actions.useInAgent}
                      </button>
                    ) : null}
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
              {onUsePrompt ? (
                <button
                  type="button"
                  onClick={() =>
                    onUsePrompt(plan.shots[0]?.imagePrompt ?? campaignIdea.trim())
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-4 py-2.5 text-xs font-black text-violet-100 transition hover:bg-violet-500/25"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  {p.actions.useInAgent}
                </button>
              ) : null}
              <button
                type="button"
                disabled
                title={p.actions.generateFullCampaignHint}
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-white/35"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {p.actions.generateFullCampaign}
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-white/30">
                  {p.badges.planned}
                </span>
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">
              {p.estimate.batchNote}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
