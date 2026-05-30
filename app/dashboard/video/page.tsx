import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import StudioWhiteVideoStudio from "../components/studio-white/StudioWhiteVideoStudio";
import { Suspense } from "react";

export default function VideoStudioPage() {
  return (
    <ObsidianLayout>
      <Suspense fallback={null}>
        <StudioWhiteVideoStudio />
      </Suspense>
    </ObsidianLayout>
  );
}
