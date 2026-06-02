import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import { guardLaunchModule } from "@/app/lib/config/launch-page-guard";
import StudioWhiteLipSyncStudio from "../components/studio-white/StudioWhiteLipSyncStudio";

export default function LipSyncStudioPage() {
  guardLaunchModule("lipSync");
  return (
    <ObsidianLayout>
      <StudioWhiteLipSyncStudio />
    </ObsidianLayout>
  );
}
