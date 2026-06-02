import {
  canRunUpgrade,
  getUpgradeCost,
  type CampaignUpgradeAction,
} from "@/lib/intelligence/campaign-upgrade-config";

export type CampaignUpgradeResult =
  | { success: true; outputUrl?: string; generationId?: string }
  | {
      success: false;
      error: string;
      code?: string;
      status?: number;
    };

export async function runCampaignUpgrade(input: {
  token: string;
  upgradeAction: CampaignUpgradeAction;
  sourceGenerationId?: string;
  script?: string;
  imageUrl?: string;
  currentLanguage?: "de" | "en";
}): Promise<CampaignUpgradeResult> {
  const res = await fetch("/api/campaign/upgrade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
      mode: "upgrade_action",
      upgradeAction: input.upgradeAction,
      sourceGenerationId: input.sourceGenerationId,
      script: input.script,
      imageUrl: input.imageUrl,
      currentLanguage: input.currentLanguage ?? "de",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    return {
      success: false,
      error: typeof data.error === "string" ? data.error : "Upgrade failed.",
      code: typeof data.code === "string" ? data.code : undefined,
      status: res.status,
    };
  }

  return {
    success: true,
    outputUrl: typeof data.outputUrl === "string" ? data.outputUrl : undefined,
    generationId: typeof data.generationId === "string" ? data.generationId : undefined,
  };
}

export { canRunUpgrade, getUpgradeCost };
