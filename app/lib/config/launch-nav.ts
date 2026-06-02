import {
  LAUNCH_CONFIG,
  sortEnginesByLaunchPriority,
} from "./launch";
import {
  OBSIDIAN_HOME_ENGINES,
  type ObsidianEngineCard,
} from "@/lib/obsidian/dashboard-tokens";

/** MVP create cards shown on the Create page (pack → image → video). */
export function getLaunchHomeEngines(): ObsidianEngineCard[] {
  const filtered = OBSIDIAN_HOME_ENGINES.filter((engine) => {
    if (engine.toolKey === "image") return LAUNCH_CONFIG.enableImageGeneration;
    if (engine.toolKey === "video") return LAUNCH_CONFIG.enableTextToVideo;
    if (engine.toolKey === "pack") return LAUNCH_CONFIG.enableSocialAssetPack;
    return false;
  });
  return sortEnginesByLaunchPriority(filtered);
}
