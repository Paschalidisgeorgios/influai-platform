"use client";

import { DashboardLanguageProvider } from "./DashboardLanguageProvider";
import { CreativeSuiteProvider } from "./components/creative-suite/CreativeSuiteProvider";
import CreativeSuiteShell from "./components/creative-suite/CreativeSuiteShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLanguageProvider>
      <CreativeSuiteProvider>
        <CreativeSuiteShell>{children}</CreativeSuiteShell>
      </CreativeSuiteProvider>
    </DashboardLanguageProvider>
  );
}
