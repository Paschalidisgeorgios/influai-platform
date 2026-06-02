"use client";

import type { ReactNode } from "react";
import PricingUiProvider from "@/app/components/billing/PricingUiProvider";
import { useDashboardLanguage } from "../DashboardLanguageProvider";

export default function DashboardPricingUi({ children }: { children: ReactNode }) {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";

  return <PricingUiProvider language={lang}>{children}</PricingUiProvider>;
}
