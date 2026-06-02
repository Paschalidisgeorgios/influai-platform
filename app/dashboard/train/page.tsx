import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import StudioWhiteTrainLoRA from "../components/studio-white/StudioWhiteTrainLoRA";
import { guardLaunchModule } from "@/app/lib/config/launch-page-guard";

export default function TrainPage() {
  guardLaunchModule("training");
  return (
    <ObsidianLayout>
      <StudioWhiteTrainLoRA />
    </ObsidianLayout>
  );
}
