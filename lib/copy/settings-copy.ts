/** Settings page copy — provider-neutral, no unsupported billing claims. */

export type ExportFormatPref = "tiktok" | "reels" | "story" | "feed";

export const EXPORT_FORMAT_OPTIONS: {
  id: ExportFormatPref;
  label: { en: string; de: string };
  hint: { en: string; de: string };
}[] = [
  {
    id: "tiktok",
    label: { en: "TikTok", de: "TikTok" },
    hint: { en: "9:16 vertical", de: "9:16 vertikal" },
  },
  {
    id: "reels",
    label: { en: "Reels", de: "Reels" },
    hint: { en: "9:16 vertical", de: "9:16 vertikal" },
  },
  {
    id: "story",
    label: { en: "Story", de: "Story" },
    hint: { en: "9:16 vertical", de: "9:16 vertikal" },
  },
  {
    id: "feed",
    label: { en: "Feed", de: "Feed" },
    hint: { en: "4:5 or 1:1", de: "4:5 oder 1:1" },
  },
];

export const SETTINGS_COPY = {
  en: {
    pageTitle: "Settings",
    pageSubtitle: "Profile, billing, credits and studio preferences.",
    profile: {
      title: "Profile",
      description: "Your signed-in creator account.",
      email: "Email",
      displayName: "Display name",
      notSet: "Not set",
    },
    billing: {
      title: "Billing",
      description: "Manage credit packs and checkout.",
      openBilling: "Open billing & credits",
      viewPricing: "View pricing",
    },
    credits: {
      title: "Credits",
      description: "Your current render balance.",
      balance: "Available credits",
      neverExpire: "Credits never expire.",
      buyMore: "Buy credits",
    },
    plan: {
      title: "Plan",
      description: "How you access InfluExAI today.",
      current: "Current access",
      creditBased: "Credit-based creator",
      freeExplore: "Free to explore",
      detailWithCredits:
        "One-time credit packs power generation. No subscription required.",
      detailNoCredits:
        "Browse modes and buy credit packs when you are ready to render.",
      upgrade: "Compare plans",
    },
    language: {
      title: "Language",
      description: "Studio and dashboard language.",
    },
    export: {
      title: "Export preferences",
      description:
        "Default format placeholders for social exports. Advanced export rules may still depend on your workflow.",
      saved: "Preference saved locally on this device.",
      placeholderNote: "Placeholder only — export behavior may vary by tool.",
    },
    privacy: {
      title: "Privacy",
      description: "How we handle prompts, uploads and rights.",
      body: "Prompts and assets run through your authenticated account workflow. Use brands, people and references only when you have the rights or consent to do so.",
      privacyPolicy: "Privacy policy",
      rightsFaq: "View on landing page",
    },
    account: {
      title: "Account",
      description: "Session and membership.",
      memberSince: "Member since",
      logOut: "Log out",
    },
  },
  de: {
    pageTitle: "Einstellungen",
    pageSubtitle: "Profil, Billing, Credits und Studio-Präferenzen.",
    profile: {
      title: "Profil",
      description: "Dein angemeldeter Creator-Account.",
      email: "E-Mail",
      displayName: "Anzeigename",
      notSet: "Nicht gesetzt",
    },
    billing: {
      title: "Billing",
      description: "Credit-Pakete und Checkout verwalten.",
      openBilling: "Billing & Credits öffnen",
      viewPricing: "Preise ansehen",
    },
    credits: {
      title: "Credits",
      description: "Dein aktuelles Render-Guthaben.",
      balance: "Verfügbare Credits",
      neverExpire: "Credits verfallen nicht.",
      buyMore: "Credits kaufen",
    },
    plan: {
      title: "Plan",
      description: "So nutzt du InfluExAI heute.",
      current: "Aktueller Zugang",
      creditBased: "Credit-basierter Creator",
      freeExplore: "Kostenlos erkunden",
      detailWithCredits:
        "Einmalige Credit-Pakete für Generierung. Kein Abo nötig.",
      detailNoCredits:
        "Modi ansehen und Credit-Pakete kaufen, wenn du rendern willst.",
      upgrade: "Pläne vergleichen",
    },
    language: {
      title: "Sprache",
      description: "Studio- und Dashboard-Sprache.",
    },
    export: {
      title: "Export-Präferenzen",
      description:
        "Standard-Format-Platzhalter für Social-Exports. Erweiterte Export-Regeln können je nach Workflow variieren.",
      saved: "Präferenz lokal auf diesem Gerät gespeichert.",
      placeholderNote: "Nur Platzhalter — Export-Verhalten kann je nach Tool variieren.",
    },
    privacy: {
      title: "Datenschutz",
      description: "Wie Prompts, Uploads und Rechte behandelt werden.",
      body: "Prompts und Assets laufen über deinen authentifizierten Account-Workflow. Nutze Marken, Personen und Referenzen nur mit den erforderlichen Rechten oder Einwilligungen.",
      privacyPolicy: "Datenschutzerklärung",
      rightsFaq: "Auf der Landingpage ansehen",
    },
    account: {
      title: "Konto",
      description: "Session und Mitgliedschaft.",
      memberSince: "Mitglied seit",
      logOut: "Abmelden",
    },
  },
} as const;
