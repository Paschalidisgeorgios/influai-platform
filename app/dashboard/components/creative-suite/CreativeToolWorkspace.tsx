"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StudioWorkspaceView from "../StudioWorkspaceView";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import CreativePageHeader from "./CreativePageHeader";
import { KreaPoweredBadge } from "../studio/KreaStudioIndicators";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { publicLaunchFlags } from "@/lib/launch/public-flags";

type ImageModeKey =
  | "standard"
  | "fast_draft"
  | "ugc_look"
  | "premium_image"
  | "brand_assets"
  | "reference_edit"
  | "enhance_asset";

type CreativeToolWorkspaceProps = {
  workspace: "image" | "video" | "lip_sync";
  initialImageMode?: ImageModeKey;
  titleEn: string;
  titleDe: string;
  subtitleEn: string;
  subtitleDe: string;
  initialPrompt?: string;
};

export default function CreativeToolWorkspace({
  workspace,
  initialImageMode,
  titleEn,
  titleDe,
  subtitleEn,
  subtitleDe,
  initialPrompt,
}: CreativeToolWorkspaceProps) {
  const router = useRouter();
  const { copy } = useDashboardLanguage();
  const {
    charactersRefreshKey,
    regenerateDraft,
    setRegenerateDraft,
    onGenerationQueued,
  } = useCreativeSuite();

  useEffect(() => {
    if (!initialPrompt?.trim()) return;
    setRegenerateDraft({
      prompt: initialPrompt.trim(),
      characterId: null,
      source: "gallery",
      loadedAt: Date.now(),
    });
  }, [initialPrompt, setRegenerateDraft]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CreativePageHeader
        titleEn={titleEn}
        titleDe={titleDe}
        subtitleEn={subtitleEn}
        subtitleDe={subtitleDe}
        badge={
          workspace === "image" && publicLaunchFlags.kreaProvider ? (
            <KreaPoweredBadge
              label={copy.dashboardNav.createStudio.poweredByKrea}
            />
          ) : null
        }
      />
      <StudioWorkspaceView
        workspace={workspace}
        appearance="dark"
        initialImageMode={initialImageMode}
        charactersRefreshKey={charactersRefreshKey}
        regenerateDraft={regenerateDraft}
        onClearRegenerateDraft={() => setRegenerateDraft(null)}
        onGenerationQueued={onGenerationQueued}
        onOpenGallery={() => router.push("/dashboard/assets")}
        onOpenCredits={() => router.push("/dashboard/credits")}
      />
    </div>
  );
}
