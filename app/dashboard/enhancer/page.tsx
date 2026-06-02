import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import ObsidianComingSoon from "../components/obsidian/ObsidianComingSoon";
import { guardLaunchModule } from "@/app/lib/config/launch-page-guard";

export default function EnhancerPage() {
  guardLaunchModule("enhancer");
  return (
    <ObsidianLayout>
      <ObsidianComingSoon titleEn="Asset Enhancer" titleDe="Asset Enhancer" />
    </ObsidianLayout>
  );
}
