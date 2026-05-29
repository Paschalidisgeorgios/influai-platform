"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getMatrixEntry,
  pathnameToMatrixTool,
  type ActiveTool,
} from "@/lib/dashboard/creative-tool-matrix";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import CreativePageHeader from "./CreativePageHeader";
import StudioWorkspaceView from "../StudioWorkspaceView";
import CharacterManager from "../../CharacterManager";
import LiveAvatarStudio from "./LiveAvatarStudio";
import KreaImageToolPanel from "./KreaImageToolPanel";
import VideoRestyleToolPanel from "./VideoRestyleToolPanel";
import MvpPlannerWorkspace from "./MvpPlannerWorkspace";

export type { ActiveTool };

type DashboardProps = {
  tool?: ActiveTool;
  initialPrompt?: string;
};

/**
 * Central creative-suite workspace router.
 * Every tool renders a functional workspace (Krea, fallback, or MVP).
 */
export default function Dashboard({ tool: toolProp, initialPrompt }: DashboardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    charactersRefreshKey,
    regenerateDraft,
    setRegenerateDraft,
    onGenerationQueued,
  } = useCreativeSuite();

  const routeTool = pathnameToMatrixTool(pathname ?? "/dashboard");
  const resolvedTool = toolProp ?? routeTool;

  const [activeTool, setActiveTool] = useState<ActiveTool>(resolvedTool);

  useEffect(() => {
    setActiveTool(resolvedTool);
  }, [resolvedTool]);

  useEffect(() => {
    if (!initialPrompt?.trim() || !activeTool) return;
    const entry = getMatrixEntry(activeTool);
    if (!entry || entry.workspaceKind !== "studio_image") return;
    setRegenerateDraft({
      prompt: initialPrompt.trim(),
      characterId: null,
      source: "gallery",
      loadedAt: Date.now(),
    });
  }, [initialPrompt, activeTool, setRegenerateDraft]);

  const entry = getMatrixEntry(activeTool);

  if (!entry) {
    return null;
  }

  const header = (
    <CreativePageHeader
      titleEn={entry.titleEn}
      titleDe={entry.titleDe}
      subtitleEn={entry.subtitleEn}
      subtitleDe={entry.subtitleDe}
    />
  );

  const wrap = (body: ReactNode) => (
    <div className="mx-auto w-full max-w-5xl">
      {header}
      {body}
    </div>
  );

  if (entry.workspaceKind === "style_profiles") {
    return (
      <div className="w-full">
        {header}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <CharacterManager />
        </div>
      </div>
    );
  }

  if (entry.workspaceKind === "live_avatar") {
    return wrap(<LiveAvatarStudio />);
  }

  if (entry.workspaceKind === "krea_image_tool" && entry.key) {
    return wrap(<KreaImageToolPanel toolKey={entry.key} />);
  }

  if (entry.workspaceKind === "video_restyle_tool") {
    return wrap(<VideoRestyleToolPanel />);
  }

  if (entry.workspaceKind === "mvp_planner" && entry.key) {
    return wrap(<MvpPlannerWorkspace toolKey={entry.key} />);
  }

  if (
    entry.workspaceKind === "studio_image" ||
    entry.workspaceKind === "studio_video" ||
    entry.workspaceKind === "studio_lip_sync"
  ) {
    const workspace =
      entry.workspaceKind === "studio_video"
        ? "video"
        : entry.workspaceKind === "studio_lip_sync"
          ? "lip_sync"
          : "image";

    return wrap(
      <StudioWorkspaceView
        workspace={workspace}
        appearance="light"
        initialImageMode={entry.initialImageMode}
        activeTool={activeTool}
        charactersRefreshKey={charactersRefreshKey}
        regenerateDraft={regenerateDraft}
        onClearRegenerateDraft={() => setRegenerateDraft(null)}
        onGenerationQueued={onGenerationQueued}
        onOpenGallery={() => router.push("/dashboard/assets")}
        onOpenCredits={() => router.push("/dashboard/credits")}
      />
    );
  }

  return wrap(
    <p className="text-sm font-medium text-white/50">
      Open this tool from the sidebar navigation.
    </p>
  );
}

export function useDashboardActiveTool() {
  const pathname = usePathname();
  const [activeTool, setActiveTool] = useState<ActiveTool>(() =>
    pathnameToMatrixTool(pathname ?? "/dashboard")
  );

  useEffect(() => {
    setActiveTool(pathnameToMatrixTool(pathname ?? "/dashboard"));
  }, [pathname]);

  return { activeTool, setActiveTool };
}
