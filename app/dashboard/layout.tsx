"use client";

import { DashboardLanguageProvider } from "./DashboardLanguageProvider";
import ObsidianShell from "./components/obsidian/ObsidianShell";
import DashboardPricingUi from "./components/DashboardPricingUi";
import { CreativeSuiteProvider } from "./components/creative-suite/CreativeSuiteProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLanguageProvider>
      <CreativeSuiteProvider>
        <DashboardPricingUi>
          <ObsidianShell>{children}</ObsidianShell>
        </DashboardPricingUi>
      </CreativeSuiteProvider>
    </DashboardLanguageProvider>
  );
}
