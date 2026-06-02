"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  Box,
  Clapperboard,
  GraduationCap,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import CreatorToolCard from "./CreatorToolCard";
import CreatorToolboxGroupHeader from "./CreatorToolboxGroupHeader";
import ToolDetailPanel from "./ToolDetailPanel";
import DashboardZoneLabel from "./DashboardZoneLabel";
import {
  CREATOR_TOOLBOX_GROUPS,
  CREATOR_TOOLBOX_SECONDARY_GROUPS,
  type CreatorToolboxGroupId,
  isToolDetailPanelStatus,
} from "@/app/lib/tools/creator-tools";
import {
  resolveCreatorTool,
  type ResolvedCreatorTool,
} from "@/app/lib/tools/resolve-tool";
import {
  hasSafeToolboxWorkflow,
  isToolboxRoutedTool,
} from "@/app/lib/tools/toolbox-workflow-routing";
import { DASHBOARD_ZONES } from "@/lib/copy/launch-user-copy";

const GROUP_ICONS: Record<CreatorToolboxGroupId, LucideIcon> = {
  create: Sparkles,
  edit: Wand2,
  animate: Clapperboard,
  train: GraduationCap,
  optimize: Star,
  advanced: Box,
};

const SECONDARY_GROUP_ICONS: Record<
  Exclude<CreatorToolboxGroupId, "create">,
  LucideIcon
> = {
  edit: Wand2,
  animate: Clapperboard,
  train: GraduationCap,
  optimize: Star,
  advanced: AudioLines,
};

export type ToolboxLaunchResult = {
  launched: boolean;
  launchContext?: string | null;
};

type Props = {
  language?: "en" | "de";
  variant?: "default" | "secondary";
  onLaunchTool?: (resolved: ResolvedCreatorTool) => ToolboxLaunchResult;
  onUpgrade?: () => void;
  className?: string;
};

export default function CreatorToolbox({
  language = "en",
  variant = "default",
  onLaunchTool,
  onUpgrade,
  className = "",
}: Props) {
  const router = useRouter();
  const isDe = language === "de";
  const groups =
    variant === "secondary"
      ? CREATOR_TOOLBOX_SECONDARY_GROUPS
      : CREATOR_TOOLBOX_GROUPS;

  const [detailTool, setDetailTool] = useState<ResolvedCreatorTool | null>(null);
  const [launchContext, setLaunchContext] = useState<string | null>(null);

  const resolvedByGroup = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          tools: group.toolIds
            .map((toolId) => resolveCreatorTool(toolId, { language }))
            .filter(
              (resolved): resolved is ResolvedCreatorTool =>
                resolved != null &&
                resolved.canShowToUser &&
                resolved.tool.toolboxGroup === group.id
            ),
        }))
        .filter((group) => group.tools.length > 0),
    [groups, language]
  );

  const handleToolClick = useCallback(
    (resolved: ResolvedCreatorTool) => {
      setLaunchContext(null);

      if (resolved.canRun) {
        if (
          onLaunchTool &&
          isToolboxRoutedTool(resolved.tool.id) &&
          hasSafeToolboxWorkflow(resolved.tool.id)
        ) {
          const result = onLaunchTool(resolved);
          if (!result.launched) {
            setLaunchContext(result.launchContext ?? null);
            setDetailTool(resolved);
          }
          return;
        }

        if (resolved.tool.href) {
          router.push(resolved.tool.href);
          return;
        }
      }

      if (isToolDetailPanelStatus(resolved.status)) {
        setDetailTool(resolved);
      }
    },
    [onLaunchTool, router]
  );

  const toolboxHint =
    variant === "secondary"
      ? isDe
        ? DASHBOARD_ZONES.toolboxSecondaryHint.de
        : DASHBOARD_ZONES.toolboxSecondaryHint.en
      : isDe
        ? DASHBOARD_ZONES.toolboxHint.de
        : DASHBOARD_ZONES.toolboxHint.en;

  return (
    <section
      className={className}
      aria-label={isDe ? DASHBOARD_ZONES.toolbox.de : DASHBOARD_ZONES.toolbox.en}
    >
      <DashboardZoneLabel
        label={isDe ? DASHBOARD_ZONES.toolbox.de : DASHBOARD_ZONES.toolbox.en}
        className="mb-1"
      />
      <p className="mb-6 text-sm leading-relaxed text-neutral-400">{toolboxHint}</p>

      <div className={variant === "secondary" ? "space-y-10" : "space-y-12"}>
        {resolvedByGroup.map((group) => {
          const Icon =
            variant === "secondary" && group.id !== "create"
              ? SECONDARY_GROUP_ICONS[
                  group.id as Exclude<CreatorToolboxGroupId, "create">
                ]
              : GROUP_ICONS[group.id];

          return (
            <section key={group.id} aria-labelledby={`toolbox-group-${group.id}`}>
              <CreatorToolboxGroupHeader
                groupId={group.id}
                label={isDe ? group.labelDe : group.labelEn}
                description={isDe ? group.descriptionDe : group.descriptionEn}
                icon={Icon}
                toolCount={group.tools.length}
                toolCountLabel={
                  isDe
                    ? group.tools.length === 1
                      ? "Tool"
                      : "Tools"
                    : group.tools.length === 1
                      ? "tool"
                      : "tools"
                }
                compact={variant === "secondary"}
              />
              <div
                id={`toolbox-group-${group.id}`}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {group.tools.map((resolved, index) => (
                  <CreatorToolCard
                    key={resolved.tool.id}
                    resolved={resolved}
                    language={language}
                    index={index}
                    size={variant === "secondary" ? "compact" : "default"}
                    onClick={() => handleToolClick(resolved)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {detailTool ? (
        <ToolDetailPanel
          open
          resolved={detailTool}
          language={language}
          launchContext={launchContext}
          onClose={() => {
            setDetailTool(null);
            setLaunchContext(null);
          }}
          onUpgrade={onUpgrade}
          onLaunchWorkflow={() => handleToolClick(detailTool)}
          onPreviewWorkflow={() => handleToolClick(detailTool)}
        />
      ) : null}
    </section>
  );
}
