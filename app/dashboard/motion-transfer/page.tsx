import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import LiveAvatarStudio from "../components/creative-suite/LiveAvatarStudio";
import { guardLaunchModule } from "@/app/lib/config/launch-page-guard";

export default function MotionTransferPage() {
  guardLaunchModule("motionTransfer");
  return (
    <ObsidianLayout>
      <LiveAvatarStudio />
    </ObsidianLayout>
  );
}
