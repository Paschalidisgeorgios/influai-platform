"use client";

import AiAgentStudio from "../AiAgentStudio";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import type { ActiveTool } from "@/lib/dashboard/tool-suite";
import {
  isPublicStudioWorkspaceEnabled,
  type PublicStudioWorkspace,
} from "@/lib/launch/public-flags";
import FeatureDisabledPanel from "./FeatureDisabledPanel";
import ToolWorkspaceShell from "./ToolWorkspaceShell";
import { WorkspaceModelPanel } from "./workspace/WorkspaceModelPanel";

type StudioTab = "image" | "video" | "creator_video" | "lip_sync" | "talking_creator";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type ImageModeKey =
  | "standard"
  | "fast_draft"
  | "ugc_look"
  | "premium_image"
  | "brand_assets"
  | "reference_edit"
  | "enhance_asset";

type StudioWorkspaceViewProps = {
  workspace: StudioTab;
  appearance?: "light" | "dark";
  activeTool?: ActiveTool;
  initialImageMode?: ImageModeKey;
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onClearRegenerateDraft?: () => void;
  onGenerationQueued?: () => void;
  onOpenGallery?: () => void;
  onOpenCredits?: () => void;
};

function betaBadgeClass() {
  return "border-orange-100 bg-orange-50 text-orange-600";
}

function plannedBadgeClass() {
  return "border-gray-200 bg-gray-50 text-slate-500";
}

export default function StudioWorkspaceView({
  workspace,
  appearance = "light",
  activeTool = "image",
  initialImageMode,
  charactersRefreshKey = 0,
  regenerateDraft = null,
  onClearRegenerateDraft,
  onGenerationQueued,
  onOpenGallery,
  onOpenCredits,
}: StudioWorkspaceViewProps) {
  const { copy } = useDashboardLanguage();
  const statuses = copy.workspaces.statuses;

  const isDark = appearance === "dark";
  let modelPanel = null;

  if (!isDark && workspace === "video") {
    const videoW = copy.workspaces.video;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: videoW.title,
            status: statuses.beta,
            statusClass: betaBadgeClass(),
            modelId: videoW.modelId,
            credits: videoW.credits,
            active: true,
          },
        ]}
      />
    );
  }

  if (!isDark && workspace === "lip_sync") {
    const lipW = copy.workspaces.lip_sync;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: lipW.title,
            status: statuses.beta,
            statusClass: betaBadgeClass(),
            modelId: lipW.modelId,
            credits: lipW.credits,
            active: true,
          },
        ]}
        footer="Voice library runs in the workspace — local previews only."
      />
    );
  }

  if (!isDark && workspace === "creator_video") {
    const creatorW = copy.workspaces.creator_video;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: creatorW.title,
            status: statuses.beta,
            statusClass: betaBadgeClass(),
            credits: creatorW.credits,
            active: true,
          },
        ]}
      />
    );
  }

  if (!isDark && workspace === "talking_creator") {
    const talkingW = copy.workspaces.talking_creator;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: "Talking Creator Pipeline",
            status: statuses.beta,
            statusClass: betaBadgeClass(),
            pipeline: talkingW.pipeline,
            credits: talkingW.credits,
            active: true,
          },
        ]}
      />
    );
  }

  return (
    <ToolWorkspaceShell modelPanel={modelPanel ?? undefined} appearance={appearance}>
      <AiAgentStudio
        lockedWorkspace={workspace}
        suiteAppearance={appearance}
        activeTool={activeTool}
        initialImageMode={initialImageMode}
        charactersRefreshKey={charactersRefreshKey}
        regenerateDraft={regenerateDraft}
        onClearRegenerateDraft={onClearRegenerateDraft}
        onGenerationQueued={onGenerationQueued}
        onOpenGallery={onOpenGallery}
        onOpenCredits={onOpenCredits}
      />
    </ToolWorkspaceShell>
  );
}
