"use client";

import CreditCostPreview from "@/app/components/billing/CreditCostPreview";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { useStudioUpsell } from "./StudioUpsellProvider";

type Props = {
  creditCost: number;
  /** Short label for what is being priced, e.g. "Image" or "Video 5s" */
  costLabel?: string;
  isPremium?: boolean;
};

export default function StudioCreditMeter({
  creditCost,
  costLabel,
  isPremium,
}: Props) {
  const { credits, creditsLoading, creditsError, refreshCredits } = useCreativeSuite();
  const { language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const { openUpsell } = useStudioUpsell();

  return (
    <CreditCostPreview
      creditCost={creditCost}
      balance={credits}
      loading={creditsLoading}
      error={creditsError}
      onRetryCredits={refreshCredits}
      language={lang}
      costLabel={costLabel}
      onBuyCredits={() =>
        openUpsell({
          requiredCredits: creditCost,
          balance: credits,
          modelModeLabel: costLabel,
          isPremium,
        })
      }
      onUpgrade={() =>
        openUpsell({
          requiredCredits: creditCost,
          balance: credits,
          modelModeLabel: costLabel,
          isPremium: true,
        })
      }
    />
  );
}
