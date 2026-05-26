"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  CalendarDays,
  Check,
  Clapperboard,
  Copy,
  Film,
  Hash,
  ImageIcon,
  ListOrdered,
  Lock,
  Megaphone,
  Package,
  Send,
  ShieldCheck,
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

type SocialScheduleSlot = {
  order: number;
  day: number;
  platform: string;
  contentTitle: string;
  timeWindow: string;
  caption: string;
};

type SocialPlannerPreview = {
  slots: SocialScheduleSlot[];
  hashtagLine: string;
  captionsText: string;
  scheduleText: string;
  platformFit: Array<{ platform: string; note: string }>;
};

type BrandSafetyChecklistItem = {
  id: string;
  label: string;
  description: string;
};

type CampaignBrief = {
  idea: string;
  brand: string;
  platform: string;
  goal: string;
};

type ExportPackageTexts = {
  fullPlanText: string;
  shotPromptsText: string;
  captionsText: string;
  contents: Array<{ label: string }>;
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

function buildSocialPlannerPreview(
  plan: CampaignPlan,
  socialCopy: ReturnType<
    typeof useDashboardLanguage
  >["copy"]["campaignPlanner"]["socialPlanner"]
): SocialPlannerPreview {
  const slots: SocialScheduleSlot[] = [
    {
      order: 1,
      day: 1,
      platform: socialCopy.platforms.instagramFeed,
      contentTitle: socialCopy.slots.launchVisual,
      timeWindow: "18:00–20:00",
      caption: plan.captions[0],
    },
    {
      order: 2,
      day: 2,
      platform: socialCopy.platforms.instagramStory,
      contentTitle: socialCopy.slots.behindTheScenes,
      timeWindow: "12:00–14:00",
      caption: plan.captions[0],
    },
    {
      order: 3,
      day: 3,
      platform: socialCopy.platforms.tiktokReels,
      contentTitle: socialCopy.slots.shortHook,
      timeWindow: "18:00–21:00",
      caption: plan.captions[1],
    },
    {
      order: 4,
      day: 4,
      platform: socialCopy.platforms.instagramStory,
      contentTitle: socialCopy.slots.engagementStory,
      timeWindow: "12:00–14:00",
      caption: plan.captions[1],
    },
    {
      order: 5,
      day: 5,
      platform: socialCopy.platforms.youtubeShorts,
      contentTitle: socialCopy.slots.recapClip,
      timeWindow: "17:00–20:00",
      caption: plan.captions[2],
    },
  ];

  const hashtagLine = plan.hashtags.join(" ");

  const scheduleText = [
    socialCopy.suggestedPostingOrder,
    "",
    ...slots.map((slot) => {
      const dayLine = socialCopy.dayLine
        .replace("{day}", String(slot.day))
        .replace("{platform}", slot.platform)
        .replace("{content}", slot.contentTitle)
        .replace("{time}", slot.timeWindow);

      return `${dayLine}\nCaption: ${slot.caption}\n${socialCopy.hashtagsLabel}: ${hashtagLine}`;
    }),
  ].join("\n\n");

  const captionsText = plan.captions
    .map((caption, index) => `Caption ${index + 1}:\n${caption}`)
    .join("\n\n");

  const platformFit = [
    {
      platform: socialCopy.platforms.instagramFeed,
      note: socialCopy.platformFitNotes.instagramFeed,
    },
    {
      platform: socialCopy.platforms.instagramStory,
      note: socialCopy.platformFitNotes.instagramStory,
    },
    {
      platform: socialCopy.platforms.tiktokReels,
      note: socialCopy.platformFitNotes.tiktokReels,
    },
    {
      platform: socialCopy.platforms.youtubeShorts,
      note: socialCopy.platformFitNotes.youtubeShorts,
    },
  ];

  return {
    slots,
    hashtagLine,
    captionsText,
    scheduleText,
    platformFit,
  };
}

function getBrandSafetyChecklistItems(
  brandSafetyCopy: ReturnType<
    typeof useDashboardLanguage
  >["copy"]["campaignPlanner"]["brandSafety"]
): BrandSafetyChecklistItem[] {
  return [
    {
      id: "ai-disclosure",
      label: brandSafetyCopy.items.aiDisclosure.label,
      description: brandSafetyCopy.items.aiDisclosure.description,
    },
    {
      id: "readable-text",
      label: brandSafetyCopy.items.readableText.label,
      description: brandSafetyCopy.items.readableText.description,
    },
    {
      id: "fake-logos",
      label: brandSafetyCopy.items.fakeLogos.label,
      description: brandSafetyCopy.items.fakeLogos.description,
    },
    {
      id: "hands-faces",
      label: brandSafetyCopy.items.handsFaces.label,
      description: brandSafetyCopy.items.handsFaces.description,
    },
    {
      id: "product-claims",
      label: brandSafetyCopy.items.productClaims.label,
      description: brandSafetyCopy.items.productClaims.description,
    },
    {
      id: "usage-rights",
      label: brandSafetyCopy.items.usageRights.label,
      description: brandSafetyCopy.items.usageRights.description,
    },
    {
      id: "platform-compliance",
      label: brandSafetyCopy.items.platformCompliance.label,
      description: brandSafetyCopy.items.platformCompliance.description,
    },
    {
      id: "watermark-disclosure",
      label: brandSafetyCopy.items.watermarkDisclosure.label,
      description: brandSafetyCopy.items.watermarkDisclosure.description,
    },
  ];
}

function buildBrandSafetyChecklistText(
  items: BrandSafetyChecklistItem[],
  title: string,
  checked: Record<string, boolean> = {}
): string {
  return [
    title,
    "",
    ...items.map((item) => {
      const mark = checked[item.id] ? "[x]" : "[ ]";
      return `${mark} ${item.label} — ${item.description}`;
    }),
  ].join("\n");
}

function buildExportPackageTexts(
  plan: CampaignPlan,
  brief: CampaignBrief,
  socialPreview: SocialPlannerPreview | null,
  labels: {
    export: ReturnType<
      typeof useDashboardLanguage
    >["copy"]["campaignPlanner"]["exportPackage"];
    sections: ReturnType<
      typeof useDashboardLanguage
    >["copy"]["campaignPlanner"]["sections"];
    contentSet: ReturnType<
      typeof useDashboardLanguage
    >["copy"]["campaignPlanner"]["contentSet"];
    shotCard: ReturnType<
      typeof useDashboardLanguage
    >["copy"]["campaignPlanner"]["shotCard"];
    fields: ReturnType<
      typeof useDashboardLanguage
    >["copy"]["campaignPlanner"]["fields"];
    brandSafety: ReturnType<
      typeof useDashboardLanguage
    >["copy"]["campaignPlanner"]["brandSafety"];
  }
): ExportPackageTexts {
  const brandSafetyItems = getBrandSafetyChecklistItems(labels.brandSafety);
  const brandSafetyText = buildBrandSafetyChecklistText(
    brandSafetyItems,
    labels.brandSafety.checklistTitle
  );

  const shotPromptsText = plan.shots
    .map((shot, index) => {
      const lines = [
        `${labels.export.shotLabel} ${index + 1}: ${shot.title}`,
        `${labels.shotCard.imagePrompt}: ${shot.imagePrompt}`,
        `${labels.shotCard.videoMotion}: ${shot.videoMotionPrompt}`,
      ];
      return lines.join("\n");
    })
    .join("\n\n");

  const captionsText = [
    labels.sections.captions,
    "",
    ...plan.captions.map(
      (caption, index) => `${labels.export.captionLabel} ${index + 1}:\n${caption}`
    ),
    "",
    `${labels.sections.hashtags}: ${plan.hashtags.join(" ")}`,
  ].join("\n");

  const contentSetText = [
    labels.sections.contentSet,
    "",
    labels.contentSet.stories,
    ...plan.contentSet.stories.map((item, index) => `${index + 1}. ${item}`),
    "",
    labels.contentSet.feedPosts,
    ...plan.contentSet.feedPosts.map((item, index) => `${index + 1}. ${item}`),
    "",
    labels.contentSet.reel,
    plan.contentSet.reelIdea,
  ].join("\n");

  const fullPlanText = [
    labels.export.fullPlanHeader,
    "",
    labels.export.campaignBriefSection,
    `${labels.fields.campaignIdea}: ${brief.idea}`,
    `${labels.fields.productBrand}: ${brief.brand}`,
    `${labels.fields.platformFocus}: ${brief.platform}`,
    `${labels.fields.goal}: ${brief.goal}`,
    "",
    labels.sections.campaignAngle,
    plan.campaignAngle,
    "",
    contentSetText,
    "",
    labels.sections.shotList,
    "",
    shotPromptsText,
    "",
    captionsText,
    "",
    labels.export.socialScheduleSection,
    socialPreview?.scheduleText ?? labels.export.socialScheduleUnavailable,
    "",
    labels.export.brandSafetySection,
    brandSafetyText,
  ].join("\n");

  return {
    fullPlanText,
    shotPromptsText,
    captionsText,
    contents: [
      { label: labels.export.contents.campaignBrief },
      { label: labels.export.contents.shotPrompts },
      { label: labels.export.contents.captions },
      { label: labels.export.contents.hashtags },
      { label: labels.export.contents.socialSchedule },
      { label: labels.export.contents.brandSafetyChecklist },
    ],
  };
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

function SocialPlannerPreviewCard({
  preview,
  copy,
}: {
  preview: SocialPlannerPreview;
  copy: ReturnType<typeof useDashboardLanguage>["copy"]["campaignPlanner"];
}) {
  const s = copy.socialPlanner;

  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-sky-500/15 bg-[linear-gradient(165deg,rgba(56,189,248,0.07)_0%,rgba(0,0,0,0.35)_45%)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-sky-100">
              {s.title}
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-white/40">{s.intro}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-violet-100">
            {copy.badges.planningBeta}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
            {s.noSocialApi}
          </span>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-200">
            {s.manualPosting}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {s.suggestedPostingOrder}
      </p>
      <ol className="mt-3 space-y-3">
        {preview.slots.map((slot) => (
          <li
            key={slot.order}
            className="rounded-xl border border-white/[0.08] bg-black/30 p-3 sm:p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs font-black text-white">
                {s.suggestedDays} {slot.day} — {slot.platform}
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold text-white/45">
                {slot.timeWindow}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-white/70">
              {slot.contentTitle}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/50">{slot.caption}</p>
            <p className="mt-2 text-[10px] leading-4 text-white/35">
              {preview.hashtagLine}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
          {s.platformFit}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {preview.platformFit.map((item) => (
            <div
              key={item.platform}
              className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5"
            >
              <p className="text-[11px] font-bold text-sky-100/90">{item.platform}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/40">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          value={preview.scheduleText}
          label={s.copySchedule}
          copiedLabel={copy.actions.copied}
        />
        <CopyButton
          value={preview.captionsText}
          label={s.copyCaptions}
          copiedLabel={copy.actions.copied}
        />
        <button
          type="button"
          disabled
          title={s.scheduleAutoHint}
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-bold text-white/35"
        >
          <Lock className="h-3 w-3" aria-hidden />
          {s.scheduleAutomatically}
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-white/30">
            {copy.badges.planned}
          </span>
        </button>
      </div>
    </section>
  );
}

function ExportPackagePreviewCard({
  exportTexts,
  copy,
}: {
  exportTexts: ExportPackageTexts;
  copy: ReturnType<typeof useDashboardLanguage>["copy"]["campaignPlanner"];
}) {
  const e = copy.exportPackage;

  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-emerald-500/15 bg-[linear-gradient(165deg,rgba(16,185,129,0.07)_0%,rgba(0,0,0,0.35)_45%)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
            <Package className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-emerald-100">
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
            {e.badges.manualExport}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
            {e.badges.pdfZipPlanned}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {e.packageContents}
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {exportTexts.contents.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2"
          >
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300/80" aria-hidden />
            <span className="text-[11px] font-semibold text-white/60">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          value={exportTexts.fullPlanText}
          label={e.copyFullPlan}
          copiedLabel={copy.actions.copied}
        />
        <CopyButton
          value={exportTexts.shotPromptsText}
          label={e.copyShotPrompts}
          copiedLabel={copy.actions.copied}
        />
        <CopyButton
          value={exportTexts.captionsText}
          label={e.copyCaptions}
          copiedLabel={copy.actions.copied}
        />
        <button
          type="button"
          disabled
          title={e.exportPdfZipHint}
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-bold text-white/35"
        >
          <Lock className="h-3 w-3" aria-hidden />
          {e.exportPdfZip}
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-white/30">
            {copy.badges.planned}
          </span>
        </button>
      </div>
    </section>
  );
}

function BrandSafetyPreviewCard({
  copy,
}: {
  copy: ReturnType<typeof useDashboardLanguage>["copy"]["campaignPlanner"];
}) {
  const b = copy.brandSafety;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = getBrandSafetyChecklistItems(b);

  const checklistText = buildBrandSafetyChecklistText(
    items,
    b.checklistTitle,
    checked
  );

  function toggleItem(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-amber-400/20 bg-[linear-gradient(165deg,rgba(251,191,36,0.07)_0%,rgba(0,0,0,0.4)_45%)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-amber-100">
              {b.title}
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-white/40">
              {b.intro}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-200">
            {b.badges.manualChecklist}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
            {b.badges.noAutomatedScan}
          </span>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-violet-100">
            {b.badges.compliancePlanned}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {b.checklistTitle}
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-xl border border-white/[0.08] bg-black/35 p-3 sm:p-4"
          >
            <div className="mt-0.5">
              <input
                id={`brand-safety-${item.id}`}
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-white/30 bg-black/60 text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              />
            </div>
            <div className="min-w-0">
              <label
                htmlFor={`brand-safety-${item.id}`}
                className="cursor-pointer text-xs font-semibold text-white"
              >
                {item.label}
              </label>
              <p className="mt-1 text-xs leading-5 text-white/50">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          value={checklistText}
          label={b.copyChecklist}
          copiedLabel={copy.actions.copied}
        />
        <button
          type="button"
          disabled
          title={b.runScanHint}
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-bold text-white/35"
        >
          <Lock className="h-3 w-3" aria-hidden />
          {b.runAutomatedScan}
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-white/30">
            {copy.badges.planned}
          </span>
        </button>
      </div>
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

  const socialPlannerPreview = useMemo(() => {
    if (!plan) return null;

    return buildSocialPlannerPreview(plan, p.socialPlanner);
  }, [plan, p.socialPlanner]);

  const exportPackageTexts = useMemo(() => {
    if (!plan) return null;

    return buildExportPackageTexts(
      plan,
      {
        idea: campaignIdea.trim() || p.defaults.ideaFallback,
        brand: productBrand.trim() || p.defaults.brandFallback,
        platform: p.platforms[platformFocus],
        goal: p.goals[goal],
      },
      socialPlannerPreview,
      {
        export: p.exportPackage,
        sections: p.sections,
        contentSet: p.contentSet,
        shotCard: p.shotCard,
        fields: p.fields,
        brandSafety: p.brandSafety,
      }
    );
  }, [
    plan,
    campaignIdea,
    productBrand,
    platformFocus,
    goal,
    socialPlannerPreview,
    p,
  ]);

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

          {socialPlannerPreview ? (
            <SocialPlannerPreviewCard preview={socialPlannerPreview} copy={p} />
          ) : null}

          <BrandSafetyPreviewCard copy={p} />

          {exportPackageTexts ? (
            <ExportPackagePreviewCard exportTexts={exportPackageTexts} copy={p} />
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
