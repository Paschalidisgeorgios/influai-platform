"use client";

import type { CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";
import { WORKSPACE_CATEGORY_COPY } from "@/lib/studio/workspace-categories";

type Props = {
  categoryId: CreatorToolboxGroupId;
  language: "en" | "de";
};

export default function CategoryWorkspaceHint({ categoryId, language }: Props) {
  const isDe = language === "de";
  const copy = WORKSPACE_CATEGORY_COPY[categoryId];

  return (
    <div className="flex min-h-[10rem] flex-col justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0F1A]/50 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-neutral-300">
        {isDe ? copy.labelDe : copy.labelEn}
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-500">
        {isDe
          ? "Wähle oben ein Tool — Einstellungen und Details erscheinen hier, sobald ein Workflow aktiv ist."
          : "Pick a tool above — settings and details appear here when a workflow is active."}
      </p>
    </div>
  );
}
