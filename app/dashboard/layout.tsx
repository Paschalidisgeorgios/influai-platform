"use client";

import { DashboardLanguageProvider } from "./DashboardLanguageProvider";
import ObsidianShell from "./components/obsidian/ObsidianShell";
import { CreativeSuiteProvider } from "./components/creative-suite/CreativeSuiteProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLanguageProvider>
      <CreativeSuiteProvider>
        <ObsidianShell>{children}</ObsidianShell>
      </CreativeSuiteProvider>
    </DashboardLanguageProvider>
  );
}
