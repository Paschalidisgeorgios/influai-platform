"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { pathnameToActiveTool } from "@/lib/dashboard/tool-suite";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import CreativeSuiteSidebar, {
  CreativeSuiteMobileHeader,
} from "./CreativeSuiteSidebar";

export default function CreativeSuiteShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { authChecked, statusMessage } = useCreativeSuite();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTool = pathnameToActiveTool(pathname ?? "/dashboard");

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-900">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
          Loading studio…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50 text-slate-900">
      <CreativeSuiteSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gray-50">
        <CreativeSuiteMobileHeader
          title="InfluExAi"
          onOpenMenu={() => setMobileOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-8">
            {statusMessage ? (
              <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 shadow-sm">
                {statusMessage}
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
