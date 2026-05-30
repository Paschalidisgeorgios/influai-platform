"use client";

import type { ReactNode } from "react";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { StudioUpsellProvider } from "../studio-white/StudioUpsellProvider";

function UpsellBridge({ children }: { children: ReactNode }) {
  const { credits, creditsLoading } = useCreativeSuite();
  return (
    <StudioUpsellProvider credits={credits} creditsLoading={creditsLoading}>
      {children}
    </StudioUpsellProvider>
  );
}

export default function ObsidianLayout({ children }: { children: ReactNode }) {
  return <UpsellBridge>{children}</UpsellBridge>;
}
