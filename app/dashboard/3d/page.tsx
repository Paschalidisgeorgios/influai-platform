import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import ObsidianComingSoon from "../components/obsidian/ObsidianComingSoon";
import { guardLaunchModule } from "@/app/lib/config/launch-page-guard";

export default function ThreeDPage() {
  guardLaunchModule("threeD");
  return (
    <ObsidianLayout>
      <ObsidianComingSoon titleEn="3D Object Render" titleDe="3D Object Render" />
    </ObsidianLayout>
  );
}
