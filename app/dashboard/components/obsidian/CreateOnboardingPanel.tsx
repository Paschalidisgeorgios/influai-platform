"use client";

import { Package } from "lucide-react";
import {
  CREATE_ONBOARDING,
  type CreateOnboardingGoalId,
} from "@/lib/copy/launch-user-copy";
import { getSocialAssetPackCopy } from "@/app/lib/packs/social-asset-pack";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  isDe: boolean;
  hasGenerations: boolean | null;
  selectedGoalId: CreateOnboardingGoalId | null;
  previewDisabled?: boolean;
  onSelectGoal: (payload: {
    goalId: CreateOnboardingGoalId;
    prompt: string;
  }) => void;
  onPreviewPack: () => void;
};

export default function CreateOnboardingPanel({
  isDe,
  hasGenerations,
  selectedGoalId,
  previewDisabled = true,
  onSelectGoal,
  onPreviewPack,
}: Props) {
  if (hasGenerations === null) {
    return <div className="min-h-[7.5rem] w-full" aria-hidden />;
  }

  if (hasGenerations) {
    return null;
  }

  const lang = isDe ? "de" : "en";
  const packCopy = getSocialAssetPackCopy(lang);
  const question = isDe
    ? CREATE_ONBOARDING.firstRunQuestion.de
    : CREATE_ONBOARDING.firstRunQuestion.en;
  const helper = isDe
    ? CREATE_ONBOARDING.helperCopy.de
    : CREATE_ONBOARDING.helperCopy.en;
  const afterHint = isDe
    ? CREATE_ONBOARDING.afterSelectionHint.de
    : CREATE_ONBOARDING.afterSelectionHint.en;
  const recommended = isDe
    ? CREATE_ONBOARDING.recommendedLabel.de
    : CREATE_ONBOARDING.recommendedLabel.en;

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5 sm:p-6">
      <div className="text-center">
        <p className="text-base font-semibold text-amber-100">{question}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{helper}</p>
      </div>

      {!selectedGoalId ? (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CREATE_ONBOARDING.goals.map((goal) => {
            const label = isDe ? goal.labelDe : goal.labelEn;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() =>
                  onSelectGoal({
                    goalId: goal.id,
                    prompt: isDe ? goal.promptDe : goal.promptEn,
                  })
                }
                className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-left text-xs font-medium text-white/80 transition hover:border-amber-500/35 hover:bg-black/40 hover:text-white hover:ring-1 hover:ring-amber-500/25"
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <Package className="h-3 w-3" aria-hidden />
              {recommended}
            </span>
            <p className="text-sm text-white/70">{afterHint}</p>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              disabled={previewDisabled}
              onClick={onPreviewPack}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${A11Y.primaryCta} disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {packCopy.previewCta}
            </button>
          </div>
          <p className="text-center text-[11px] text-white/45">
            {packCopy.costNote}
          </p>
        </div>
      )}
    </section>
  );
}
