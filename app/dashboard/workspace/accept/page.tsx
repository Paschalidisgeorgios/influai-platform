"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ObsidianLayout from "../../components/obsidian/ObsidianLayout";
import ObsidianShell from "../../components/obsidian/ObsidianShell";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

function WorkspaceAcceptContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { language } = useDashboardLanguage();
  const isDe = language === "de";

  return (
    <ObsidianLayout>
      <ObsidianShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d8ad5f]">
            {isDe ? "Team Workspace" : "Team Workspace"}
          </p>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {isDe ? "Einladung annehmen" : "Accept invitation"}
          </h1>
          <p className="mt-3 text-sm text-white/50">
            {token
              ? isDe
                ? "Die Einladung wird in einer späteren Version automatisch verarbeitet. Token wurde erkannt."
                : "Invitation acceptance will be automated in a future release. Token detected."
              : isDe
                ? "Kein gültiger Einladungslink."
                : "No valid invitation link."}
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-full bg-[#d8ad5f] px-6 py-3 text-sm font-bold text-black hover:bg-[#efc777]"
          >
            {isDe ? "Zum Dashboard" : "Go to dashboard"}
          </Link>
        </div>
      </ObsidianShell>
    </ObsidianLayout>
  );
}

export default function WorkspaceAcceptPage() {
  return (
    <Suspense fallback={null}>
      <WorkspaceAcceptContent />
    </Suspense>
  );
}
