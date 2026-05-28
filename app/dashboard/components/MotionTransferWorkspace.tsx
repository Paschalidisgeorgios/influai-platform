"use client";

import { ImagePlus, Upload, Wand2 } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import { WorkspaceModelPanel } from "./workspace/WorkspaceModelPanel";

function statusClass(kind: "planned" | "comingSoon") {
  if (kind === "comingSoon") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-100";
  }
  return "border-white/10 bg-white/[0.04] text-white/40";
}

export default function MotionTransferWorkspace() {
  const { copy } = useDashboardLanguage();
  const w = copy.workspaces.motion_transfer;

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d8ad5f]">
          {w.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{w.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{w.subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="lg:w-[280px] shrink-0">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0e] p-4">
            <WorkspaceModelPanel
              title={w.modelTitle}
              cards={[
                {
                  name: "Kling Motion Control",
                  status: copy.workspaces.statuses.planned,
                  statusClass: statusClass("planned"),
                },
                {
                  name: "Runway Aleph",
                  status: copy.workspaces.statuses.planned,
                  statusClass: statusClass("planned"),
                },
                {
                  name: "Wan Animate",
                  status: copy.workspaces.statuses.planned,
                  statusClass: statusClass("planned"),
                },
              ]}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
                <ImagePlus className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-black text-white">{w.addCharacter}</p>
              <p className="mt-2 text-xs text-white/40">{w.stepCharacter}</p>
              <button
                type="button"
                disabled
                className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-white/40"
              >
                {w.addCharacter}
              </button>
            </div>

            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-black text-white">{w.addMotion}</p>
              <p className="mt-2 text-xs text-white/40">{w.stepMotion}</p>
              <button
                type="button"
                disabled
                className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-white/40"
              >
                {w.addMotion}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 text-center">
            <Wand2 className="h-10 w-10 text-white/25" />
            <p className="mt-4 text-sm font-bold text-white/55">{w.stepGenerate}</p>
            <button
              type="button"
              disabled
              className="mt-5 cursor-not-allowed rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-black text-white/35"
            >
              {w.generateButton}
            </button>
            <p className="mt-3 text-xs text-white/35">{w.comingSoonNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
