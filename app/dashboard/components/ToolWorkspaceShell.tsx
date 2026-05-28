"use client";

import type { ReactNode } from "react";

type ToolWorkspaceShellProps = {
  modelPanel?: ReactNode;
  children: ReactNode;
};

export default function ToolWorkspaceShell({
  modelPanel,
  children,
}: ToolWorkspaceShellProps) {
  if (!modelPanel) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-0">
      <aside className="shrink-0 lg:w-[280px] lg:border-r lg:border-white/10 lg:pr-4">
        <div className="sticky top-0 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#0a0a0e] p-4 lg:max-h-[calc(100vh-6rem)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
          {modelPanel}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
