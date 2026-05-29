"use client";

import CreditsCard from "../../CreditsCard";
import CreativePageHeader from "./CreativePageHeader";
import { useCreativeSuite } from "./CreativeSuiteProvider";

export default function CreativeCredits() {
  const { creditsRefreshKey } = useCreativeSuite();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CreativePageHeader
        titleEn="Credits / Billing"
        titleDe="Credits / Abrechnung"
        subtitleEn="Manage your balance, plans and custom top-ups."
        subtitleDe="Verwalte Guthaben, Pakete und individuelle Aufladungen."
      />
      <CreditsCard appearance="dark" refreshKey={creditsRefreshKey} />
    </div>
  );
}
