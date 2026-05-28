"use client";

import type { ReactNode } from "react";

type ToolWorkspaceShellProps = {
  modelPanel?: ReactNode;
  children: ReactNode;
  appearance?: "light" | "dark";
};

export default function ToolWorkspaceShell({
  modelPanel,
  children,
  appearance = "dark",
}: ToolWorkspaceShellProps) {
  const isLight = appearance === "light";

  if (!modelPanel) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-visible">
        {children}
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 overflow-visible xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="min-w-0 shrink-0">
        <div
          className={`max-h-none overflow-visible rounded-2xl p-4 xl:sticky xl:top-0 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:overscroll-contain xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 ${
            isLight
              ? "border border-gray-200 bg-white shadow-sm xl:border-0 xl:shadow-none"
              : "border border-white/10 bg-[#0a0a0e] xl:border-0 xl:bg-transparent"
          }`}
        >
          {modelPanel}
        </div>
      </aside>
      <div className="min-h-0 min-w-0 overflow-visible space-y-6">{children}</div>
    </div>
  );
}
