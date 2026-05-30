"use client";

import { useCallback, type MouseEvent, type ReactNode } from "react";
import { useMotionValue } from "framer-motion";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import KineticCursor from "./KineticCursor";
import ObsidianHUDSidebar from "./ObsidianHUDSidebar";

export default function ObsidianShell({ children }: { children: ReactNode }) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    },
    [cursorX, cursorY]
  );

  return (
    <div className={`flex h-screen ${OBS.page}`} onMouseMove={onMouseMove}>
      <ObsidianHUDSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
      <KineticCursor cursorX={cursorX} cursorY={cursorY} />
    </div>
  );
}
