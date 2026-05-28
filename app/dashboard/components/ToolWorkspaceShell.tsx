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
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-0">
      <aside
        className={`shrink-0 lg:w-[280px] lg:pr-4 ${
          isLight ? "lg:border-r lg:border-gray-200" : "lg:border-r lg:border-white/10"
        }`}
      >
        <div
          className={`sticky top-0 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain rounded-2xl p-4 lg:max-h-[calc(100vh-6rem)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 ${
            isLight
              ? "border border-gray-200 bg-white shadow-sm"
              : "border border-white/10 bg-[#0a0a0e]"
          }`}
        >
          {modelPanel}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
