"use client";

import AiAgentStudio from "../AiAgentStudio";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import ToolWorkspaceShell from "./ToolWorkspaceShell";
import { WorkspaceModelPanel } from "./workspace/WorkspaceModelPanel";

type StudioTab = "image" | "video" | "creator_video" | "lip_sync" | "talking_creator";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type StudioWorkspaceViewProps = {
  workspace: StudioTab;
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onClearRegenerateDraft?: () => void;
  onGenerationQueued?: () => void;
  onOpenGallery?: () => void;
  onOpenCredits?: () => void;
};

function betaBadgeClass() {
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function plannedBadgeClass() {
  return "border-gray-200 bg-gray-50 text-slate-500";
}

export default function StudioWorkspaceView({
  workspace,
  charactersRefreshKey = 0,
  regenerateDraft = null,
  onClearRegenerateDraft,
  onGenerationQueued,
  onOpenGallery,
  onOpenCredits,
}: StudioWorkspaceViewProps) {
  const { copy } = useDashboardLanguage();
  const statuses = copy.workspaces.statuses;

  let modelPanel = null;

  if (workspace === "video") {
    const videoW = copy.workspaces.video;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: videoW.modelName,
            status: statuses.beta,
            statusClass: betaBadgeClass(),
            modelId: videoW.modelId,
            credits: videoW.credits,
            active: true,
          },
          {
            name: "Seedance",
            status: statuses.planned,
            statusClass: plannedBadgeClass(),
          },
          {
            name: "Kling Pro",
            status: statuses.planned,
            statusClass: plannedBadgeClass(),
          },
        ]}
      />
    );
  }

  if (workspace === "lip_sync") {
    const lipW = copy.workspaces.lip_sync;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: lipW.modelName,
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

  if (workspace === "creator_video") {
    const creatorW = copy.workspaces.creator_video;
    modelPanel = (
      <WorkspaceModelPanel
        appearance="light"
        title={copy.workspaces.modelTitle}
        cards={[
          {
            name: "Nano Banana Pro Edit",
            status: statuses.beta,
            statusClass: betaBadgeClass(),
            active: true,
          },
          {
            name: "Kling Image-to-Video",
            status: statuses.beta,
            statusClass: betaBadgeClass(),
          },
        ]}
        footer={`${creatorW.pipeline} · ${creatorW.credits}`}
      />
    );
  }

  if (workspace === "talking_creator") {
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
    <ToolWorkspaceShell modelPanel={modelPanel ?? undefined} appearance="light">
      <AiAgentStudio
        lockedWorkspace={workspace}
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
