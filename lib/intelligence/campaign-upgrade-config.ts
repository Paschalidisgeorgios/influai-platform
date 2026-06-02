/** Campaign upgrade actions — costs and helpers (CampaignExpansionEngine). */

export type CampaignUpgradeAction =
  | "animate_script"
  | "voiceover_script"
  | "avatar_lipsync_motion";

export const CAMPAIGN_UPGRADE_COSTS: Record<CampaignUpgradeAction, number> = {
  animate_script: 25,
  voiceover_script: 10,
  avatar_lipsync_motion: 30,
};

/** Upgrades not yet wired to Krea-only engines — UI disables these cards. */
export const CAMPAIGN_UPGRADE_DISABLED: Record<CampaignUpgradeAction, boolean> = {
  animate_script: false,
  voiceover_script: true,
  avatar_lipsync_motion: true,
};

/** Backend returns this until Krea handlers are connected. */
export const KREA_UPGRADE_NOT_IMPLEMENTED: CampaignUpgradeAction[] = [
  "animate_script",
  "voiceover_script",
  "avatar_lipsync_motion",
];

export function isValidUpgradeAction(
  value: unknown
): value is CampaignUpgradeAction {
  return (
    value === "animate_script" ||
    value === "voiceover_script" ||
    value === "avatar_lipsync_motion"
  );
}

export function getUpgradeCost(action: CampaignUpgradeAction): number {
  return CAMPAIGN_UPGRADE_COSTS[action];
}

export function canRunUpgrade(cost: number, credits: number | null): boolean {
  return typeof credits === "number" && credits >= cost;
}
