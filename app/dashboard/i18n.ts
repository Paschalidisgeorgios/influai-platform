export type DashboardLanguage = "en" | "de";

export const LANGUAGE_STORAGE_KEY = "influexai_language";

export function readStoredLanguage(): DashboardLanguage {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "de" ? "de" : "en";
}

const en = {
  language: {
    english: "English",
    german: "Deutsch",
    label: "Language",
  },
  sidebar: {
    creatorStudio: "AI Creator Studio",
    workspaceOwner: "Workspace Owner",
    liveStudio: "Live Studio",
    expansionModules: "Expansion modules",
    expansionIntro:
      "Video Studio and Lip Sync Studio are coming soon. Cinema Agent and Omni Campaign Agent are on the roadmap. Not live in this release.",
    expansionFootnote:
      "Includes Premium Image Modes and advanced studio workflows — preview only, not billable.",
    roadmap: "Roadmap",
    roadmapBody:
      "Video Studio and Lip Sync Studio are coming soon. Cinema Agent and Omni Campaign Agent are on the roadmap. All expansion modules are disabled here — no routing, API calls or credit usage in this MVP.",
    watermarkedPromoTitle: "Watermarked Promo Package",
    watermarkedPromoBadge: "Planned",
    watermarkedPromoBody:
      "Low-cost watermarked exports for early testing and brand discovery — planned monetization module, not live yet. Upgrade later to export without watermark.",
    home: "Home",
    logout: "Logout",
    studioMenu: "Studio Menu",
    live: "Live",
    comingSoon: "Coming soon",
    planned: "Planned",
    roadmapBadge: "Roadmap",
    moduleUnavailable: "Not available in the current release.",
    nav: {
      agent: { label: "AI Agent", description: "Generate campaign visuals" },
      gallery: { label: "Asset Gallery", description: "Manage generated assets" },
      characters: {
        label: "Style Profiles",
        description: "Reusable creative direction",
      },
      credits: { label: "Credits", description: "Balance and packages" },
    },
    expansion: {
      videoStudio: {
        label: "Video Studio",
        description:
          "Create short-form video campaigns, product clips and creator motion assets from prompts and images.",
      },
      lipSyncStudio: {
        label: "Lip Sync Studio",
        description:
          "Generate talking creator clips from scripts, voice and visual assets.",
      },
      brandAssets: {
        label: "Brand Assets",
        description:
          "Campaign kits, brand memory and reusable visual rules for teams.",
      },
      automation: {
        label: "Automation",
        description:
          "Scheduled generation, batch workflows and campaign automation.",
      },
      cinemaAgent: {
        label: "Cinema Agent",
        description:
          "Plan campaign scenes, shot lists and visual sequences before generation.",
      },
      omniCampaignAgent: {
        label: "Omni Campaign Agent",
        description:
          "Turn a campaign idea into visuals, video concepts, captions and export-ready assets.",
      },
    },
  },
  page: {
    checkoutSuccess:
      "Payment successful. Your credits have been added to your balance.",
    checkoutCancelled: "Checkout was cancelled. No charges were made.",
    generationQueued: "Generation queued successfully.",
    promptLoaded: "Prompt loaded back into the AI Agent.",
    styleProfilesUpdated: "Style profiles updated.",
    gallery: {
      eyebrow: "Creator Assets",
      title: "Asset Gallery",
      description:
        "Review generated visuals, manage processing jobs, save favorites, regenerate prompts and download your best campaign assets.",
    },
    characters: {
      eyebrow: "Reusable Creative Direction",
      title: "Style Profiles",
      description:
        "Create reusable visual profiles that guide appearance, styling, mood and brand direction for consistent creative output.",
    },
    credits: {
      eyebrow: "Billing",
      title: "Credits & Plans",
      description:
        "View your balance, understand credit usage (1 standard image = 1 credit) and purchase Starter, Professional or Ultimate packages via secure Stripe checkout.",
    },
  },
  compactCredits: {
    credits: "Credits",
    loadingCredits: "Loading credits",
    creditsAvailable: "{count} credits available",
    refreshCredits: "Refresh credits",
    zeroCreditsHint: "No credits left — open Credits to buy a package",
  },
  agent: {
    title: "Create campaign-ready visuals",
    subtitle:
      "Generate premium creator visuals, product shots and social media campaign assets. Use style profiles for reusable creative direction.",
    enterHint: "Enter to generate · Shift+Enter for a new line",
    promptPlaceholder: "Describe the visual you want to create",
    agent: "Agent",
    styleProfileNone: "Style profile: none",
    loadingStyleProfiles: "Loading style profiles…",
    styleProfileAria: "Style profile",
    socialFormat: "Social Format",
    standard: "Standard",
    styleProfile: "Style Profile",
    imageMode: "Image Mode",
    imageModeIntro:
      "Choose how the AI Agent generates visuals. Standard Image is the production default. Fast Draft is optional when enabled for your environment.",
    imageModeStandardActiveNote: "Standard Image · Live · 1 Credit",
    imageModeFastDraftActiveNote: "Fast Draft · Beta · 1 Credit",
    imageModePremiumActiveNote: "Premium Image · Beta · 3 Credits",
    imageModeReferenceEditActiveNote: "Reference Edit · Beta · 5 Credits",
    imageModeBrandAssetsActiveNote: "Brand Assets · Beta · 4 Credits",
    plannedExpansion: "Studio roadmap",
    imageModeActiveNote: "Standard Image · Live · 1 Credit",
    imageModeRoadmapLabel: "Also on the studio roadmap",
    imageModeRoadmapNote:
      "Preview only — not connected to generation or billing yet.",
    referenceEditMissingSource: "Upload a source image for Reference Edit.",
    referenceEditMissingInstruction:
      "Add edit instructions for Reference Edit.",
    studioRoadmapChips: [
      "Fast Draft Mode",
      "Premium Image Mode",
      "Reference Edit Mode",
      "Brand Assets",
      "Video Studio",
      "Lip Sync Studio",
      "Cinema Agent",
      "Omni Campaign Agent",
    ],
    imageModes: {
      standard: {
        label: "Standard Image",
        description:
          "Reliable campaign visuals powered by the production image workflow.",
      },
      fastDraft: {
        label: "Fast Draft",
        description:
          "Faster low-cost drafts for quick visual exploration.",
      },
      premium: {
        label: "Premium Image",
        description:
          "Higher-quality campaign visuals for advanced creator assets.",
      },
      referenceEdit: {
        label: "Reference Edit",
        description:
          "Upload an image and guide precise campaign-ready edits.",
        hoverHint:
          "Reference Edit supports source images, edit instructions and guided campaign refinements.",
        panel: {
          statusPlanned: "Coming soon · Planned",
          statusActive: "Beta",
          introPlanned:
            "Reference Edit is being prepared for guided image transformations.",
          introActive:
            "Upload a source image and describe the changes you want. Results appear in the agent and gallery.",
          sourceLabel: "Source image",
          sourcePlaceholder: "Upload a source image to begin",
          sourceHint: "PNG, JPEG, or WebP · max 12 MB",
          uploadSourceImage: "Upload source image",
          uploading: "Uploading…",
          clearImage: "Clear image",
          invalidFile: "Please choose a JPEG, PNG, or WebP image.",
          fileTooLarge: "Image is too large (max 12 MB).",
          uploadFailed: "Upload failed. Please try again.",
          instructionLabel: "Edit instructions",
          instructionPlaceholder:
            "Describe what to change: background, lighting, product details, framing…",
          previewLabel: "Result preview",
          previewPlaceholder: "Edited result will appear here after generation",
          generateDisabled: "Generate — coming soon",
          generationNotActive:
            "Generation is not active yet. Use Standard, Fast Draft, or Premium Image below.",
          plannedNote:
            "Reference Edit is being prepared for guided image transformations. Upload and instructions are available for workflow preview. Generation is not active yet.",
          activeNote:
            "Reference Edit uses your source image and instructions to create a new campaign-ready visual.",
        },
      },
      brandAssets: {
        label: "Brand Assets",
        description:
          "Generate brand-ready ad creatives, product layouts and campaign assets.",
        hoverHint:
          "Brand Assets supports ad creatives, product campaign layouts, thumbnails and social marketing visuals.",
      },
      live: "Live",
      beta: "Beta",
      oneCredit: "1 Credit",
      twoCredits: "2 Credits",
      threeCredits: "3 Credits",
      fourCredits: "4 Credits",
      fiveCredits: "5 Credits",
      planned: "Planned",
      comingSoon: "Coming soon",
      plannedTooltip: "Planned — not available in this release",
    },
    modes: {
      auto: {
        label: "Auto",
        description: "Balanced creative direction for most prompts.",
      },
      portrait: {
        label: "Portrait",
        description:
          "Best for creator portraits, editorials and people-focused visuals.",
      },
      product: {
        label: "Product",
        description: "Best for product shots, brand visuals and ad creatives.",
      },
      campaign: {
        label: "Campaign",
        description:
          "Best for social ads, campaign concepts and creator marketing.",
      },
    },
    formats: {
      square: { label: "Square", platform: "General", description: "Universal post" },
      tiktok: {
        label: "TikTok / Reels",
        platform: "TikTok",
        description: "Vertical short-form",
      },
      instagram_post: {
        label: "Instagram Post",
        platform: "Instagram",
        description: "Feed portrait",
      },
      instagram_story: {
        label: "Instagram Story",
        platform: "Instagram",
        description: "Story format",
      },
      youtube_thumbnail: {
        label: "YouTube Thumb",
        platform: "YouTube",
        description: "Wide thumbnail",
      },
      youtube_shorts: {
        label: "YouTube Shorts",
        platform: "YouTube",
        description: "Vertical shorts",
      },
    },
    latestResult: "Latest result",
    generating: "Generating your image…",
    completed: "Generation completed",
    failed: "Generation failed",
    openImage: "Open image",
    viewInGallery: "View in Gallery",
    createAnother: "Create another",
    processingHint:
      "Processing in the background. The image will appear here automatically.",
    processingStay:
      "Please wait while InfluExAi generates and saves your image. Stay on this page — the result appears here automatically.",
    currentJob: "Current job",
    imageUrlMissing: "Image URL missing",
    styleProfilesFooter:
      "Style profiles guide the look, mood and creative direction.",
    preparingWithProfile: "Preparing generation using {name} as style profile.",
    preparingFormat:
      "Preparing generation for {format} ({ratio}).",
    queuedWithProfile: "Generation queued using {name} as style profile.",
    describePrompt: "Please describe what you want to create.",
    signInAgain: "Please sign in again.",
    notEnoughCredits: "Not enough credits. Please buy more credits.",
    insufficientCreditsTitle: "Not enough credits",
    insufficientCreditsIntro:
      "Not enough credits for this generation.",
    insufficientCreditsModeRequires: "This mode requires {count} credits.",
    insufficientCreditsBuyMore: "Buy more credits to continue.",
    buyCredits: "Buy Credits",
    openCredits: "Open Credits",
    profileNotFound: "Selected style profile was not found.",
    queueFailed: "Failed to queue generation. Please try again.",
    noGenerationId: "Generation was queued, but no generation ID returned.",
    networkError: "Network error. Please try again.",
    creditsRefundedHint: "Credits were refunded.",
    promptLoadedRegeneration: "Prompt loaded for regeneration.",
  },
  gallery: {
    loading: "Loading asset gallery...",
    empty: "No matching assets in your gallery.",
    searchPlaceholder: "Search prompts...",
    allStyleProfiles: "All style profiles",
    noStyleProfile: "No style profile",
    filterAll: "All",
    completed: "Completed",
    processing: "Processing",
    failed: "Failed",
    favorites: "Favorites",
    standard: "Standard",
    noStyleProfileShort: "no style profile",
    creditOne: "1 credit",
    creditsCount: "{count} credits",
    processingLabel: "Processing",
    generationFailed: "Generation failed",
    creditsRefundedHint: "Credits were refunded.",
    unknownError: "Unknown error",
    imageUnavailable: "Image unavailable",
    noImageUrl: "This generation has no image URL.",
    imageCouldNotLoad: "Image could not load",
    renderFailed: "The file exists, but the gallery could not render it.",
    openImageDirectly: "Open image directly",
    loadMore: "Load more",
    loadingMore: "Loading...",
    deleteConfirm: "Delete this generation permanently?",
    copied: "copied",
    inProgressTitle: "Generation in progress",
    inProgressBody:
      "The gallery refreshes automatically while your image is being created.",
    modalUnavailableTitle: "Image unavailable",
    modalUnavailableBody:
      "This generation has no valid image URL or could not be rendered in the gallery.",
    prompt: "Prompt",
    finalPrompt: "Final prompt",
    error: "Error",
    copyPrompt: "Copy prompt",
    copyFinalPrompt: "Copy final prompt",
    deleteGeneration: "Delete generation",
    regenerate: "Regenerate",
    addFavorite: "Add favorite",
    removeFavorite: "Remove favorite",
    openDownloadImage: "Open / download image",
    processingHint:
      "Your image is being generated. The gallery refreshes automatically.",
  },
  styleProfiles: {
    loading: "Loading style profiles...",
    brandDirection: "Brand & creator direction",
    disclaimer:
      "Style profiles guide look, mood, styling and brand direction. They are not fixed identity models.",
    newProfile: "New style profile",
    buildDirection: "New style profile",
    buildDescription:
      "Build reusable creative direction for campaign visuals — appearance, mood and brand styling in one profile.",
    profileName: "Profile name",
    profileNamePlaceholder: "e.g. Luxury fitness creator",
    creativeTag: "Creative tag (optional)",
    creativeTagPlaceholder: "e.g. Editorial · Product",
    profileSummary: "Profile summary",
    profileSummaryPlaceholder: "Short description of this profile's creative role...",
    creativeDirection: "Creative direction",
    appearanceDirection: "Appearance direction",
    appearancePlaceholder: "Hair, wardrobe, subject framing, signature look...",
    styleDirection: "Style direction",
    stylePlaceholder: "Lighting, lens, color grading, mood, brand aesthetic...",
    creating: "Creating...",
    createProfile: "Create style profile",
    emptyTitle: "No style profiles yet",
    emptyBody:
      "Create your first style profile, then upload visual references to guide look and mood in the AI Agent.",
    styleProfileBadge: "Style Profile",
    coverReference: "Cover Reference",
    noCoverYet: "No cover reference yet",
    noCoverHint:
      "Upload a visual reference — the first image becomes the cover reference.",
    noSummary: "No profile summary yet.",
    removeProfile: "Remove profile",
    notDefined: "Not defined yet.",
    visualReferences: "Visual references",
    uploadHint: "Upload visual references to guide the profile's look and mood.",
    referenceCount: "{count} visual reference",
    referenceCountPlural: "{count} visual references",
    uploadReference: "Upload reference",
    uploading: "Uploading…",
    addReferences: "Add visual references",
    addReferencesHint:
      "Upload mood frames, product shots or campaign stills. The first upload becomes the cover reference.",
    chooseImage: "Choose image",
    setCoverReference: "Set as cover reference",
    removeReference: "Remove visual reference",
    deleteProfileConfirm:
      "Delete this style profile and all its visual references?",
    deleteReferenceConfirm: "Delete this visual reference?",
    created: "Style profile created.",
    deleted: "Style profile deleted.",
    referenceUploaded: "Visual reference uploaded.",
    coverUpdated: "Cover reference updated.",
    referenceDeleted: "Visual reference deleted.",
    nameRequired: "Style profile name is required.",
    loadFailed: "Failed to load style profiles.",
    createFailed: "Failed to create style profile.",
    deleteFailed: "Failed to delete style profile.",
    uploadFailed: "Failed to upload visual reference.",
    coverFailed: "Failed to set cover reference.",
    referenceDeleteFailed: "Failed to delete visual reference.",
    signInAgain: "Please sign in again.",
  },
  credits: {
    accountBalance: "Account balance",
    creditsTitle: "Credits",
    balanceDescription:
      "Credits are used when you generate images in the AI Agent. Each standard image uses one credit.",
    modeUsageIntro: "Credits are used depending on the selected mode.",
    modeCosts: {
      standard: "Standard Image: 1 Credit",
      fastDraft: "Fast Draft: 1 Credit",
      premium: "Premium Image: 3 Credits",
      referenceEdit: "Reference Edit: 5 Credits",
      brandAssets: "Brand Assets: 4 Credits",
    },
    oneCreditRule: "1 standard image = 1 credit",
    availableCredits: "Available credits",
    refreshing: "Refreshing balance…",
    refreshBalance: "Refresh balance",
    creditPackages: "Credit packages",
    choosePlan: "Choose a plan for your workflow",
    secureCheckout: "Secure checkout via Stripe",
    price: "Price",
    creditsIncluded: "Credits included",
    creditsUnit: "Credits",
    standardImages: "≈ {count} standard images (1 image = 1 credit)",
    redirecting: "Redirecting to checkout…",
    footerNote:
      "Credits are added to your account after successful payment. Unused credits remain on your balance until used in the AI Agent.",
    recommended: "Recommended",
    sessionExpired: "Your session expired. Please sign in again.",
    loadFailed:
      "We could not load your credit balance. Please try again.",
    loadConnection:
      "We could not load your credit balance. Check your connection and try again.",
    checkoutFailed:
      "Checkout could not be started. Please try again in a moment.",
    checkoutNoUrl:
      "Checkout could not be started. No payment link was returned.",
    checkoutConnection:
      "Checkout could not be started. Check your connection and try again.",
    watermarkedPromo: {
      eyebrow: "Planned monetization",
      title: "Watermarked Promo Package",
      badge: "Planned",
      description:
        "Watermarked promo exports — planned. Low-cost watermarked exports for early testing and brand discovery.",
      upgradeNote: "Upgrade later to export without watermark.",
      notAvailable:
        "Not available for purchase in this release. Starter, Professional and Ultimate remain the active packages.",
    },
    features: {
      aiAgent: "AI Agent",
      socialFormats: "Social Formats",
      styleProfiles: "Style Profiles",
      assetGallery: "Asset Gallery",
    },
    packages: {
      starter: {
        tagline: "For testing",
        description:
          "Try prompts, formats and gallery workflows before scaling production.",
        benefits: [
          "AI Agent image generation",
          "Social media format presets",
          "Asset Gallery storage",
          "Ideal for testing and early ideas",
        ],
        button: "Buy Starter",
      },
      professional: {
        tagline: "Recommended for regular creators",
        description:
          "The balanced package for consistent campaign output and reusable creative direction.",
        benefits: [
          "Everything in Starter",
          "Style Profiles for reusable direction",
          "Built for regular creator workflows",
          "Best value for ongoing production",
        ],
        button: "Buy Professional",
      },
      ultimate: {
        tagline: "For high-volume workflows",
        description:
          "Scale content production with a large credit reserve for teams and heavy usage.",
        benefits: [
          "Everything in Professional",
          "High-volume image generation",
          "Suited for agencies and power users",
          "Maximum runway per purchase",
        ],
        button: "Buy Ultimate",
      },
    },
  },
} as const;

type DeepString<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepString<U>[]
    : T extends object
      ? { [K in keyof T]: DeepString<T[K]> }
      : T;

const de: DeepString<typeof en> = {
  language: {
    english: "English",
    german: "Deutsch",
    label: "Sprache",
  },
  sidebar: {
    creatorStudio: "AI Creator Studio",
    workspaceOwner: "Workspace-Inhaber",
    liveStudio: "Live Studio",
    expansionModules: "Erweiterungsmodule",
    expansionIntro:
      "Video Studio und Lip Sync Studio sind demnächst verfügbar. Cinema Agent und Omni Campaign Agent sind auf der Roadmap. In diesem Release nicht live.",
    expansionFootnote:
      "Umfasst Premium Image Modes und erweiterte Studio-Workflows — nur Vorschau, nicht abrechenbar.",
    roadmap: "Roadmap",
    roadmapBody:
      "Video Studio und Lip Sync Studio sind demnächst verfügbar. Cinema Agent und Omni Campaign Agent sind auf der Roadmap. Alle Erweiterungsmodule sind hier deaktiviert — kein Routing, keine API-Aufrufe und kein Credit-Verbrauch in diesem MVP.",
    watermarkedPromoTitle: "Watermarked Promo-Paket",
    watermarkedPromoBadge: "Geplant",
    watermarkedPromoBody:
      "Günstige Exporte mit sichtbarem InfluExAi-Wasserzeichen zum Testen und für Brand Discovery — geplantes Monetarisierungsmodul, noch nicht live. Später Upgrade für Export ohne Wasserzeichen.",
    home: "Startseite",
    logout: "Abmelden",
    studioMenu: "Studio-Menü",
    live: "Live",
    comingSoon: "Demnächst",
    planned: "Geplant",
    roadmapBadge: "Roadmap",
    moduleUnavailable: "In der aktuellen Version nicht verfügbar.",
    nav: {
      agent: {
        label: "AI Agent",
        description: "Kampagnenvisuals generieren",
      },
      gallery: {
        label: "Asset Gallery",
        description: "Generierte Assets verwalten",
      },
      characters: {
        label: "Style Profiles",
        description: "Wiederverwendbare Creative Direction",
      },
      credits: { label: "Credits", description: "Guthaben und Pakete" },
    },
    expansion: {
      videoStudio: {
        label: "Video Studio",
        description:
          "Erstelle Short-Form-Video-Kampagnen, Produktclips und Creator-Motion-Assets aus Prompts und Bildern.",
      },
      lipSyncStudio: {
        label: "Lip Sync Studio",
        description:
          "Generiere sprechende Creator-Clips aus Skripten, Voice und Visual Assets.",
      },
      brandAssets: {
        label: "Brand Assets",
        description:
          "Campaign Kits, Brand Memory und wiederverwendbare Visual Rules für Teams.",
      },
      automation: {
        label: "Automation",
        description:
          "Geplante Generierung, Batch-Workflows und Kampagnen-Automation.",
      },
      cinemaAgent: {
        label: "Cinema Agent",
        description:
          "Plane Kampagnen-Szenen, Shot Lists und Visual Sequences vor der Generierung.",
      },
      omniCampaignAgent: {
        label: "Omni Campaign Agent",
        description:
          "Wandle eine Kampagnen-Idee in Visuals, Video-Konzepte, Captions und exportfertige Assets um.",
      },
    },
  },
  page: {
    checkoutSuccess:
      "Zahlung erfolgreich. Deine Credits wurden deinem Guthaben gutgeschrieben.",
    checkoutCancelled:
      "Checkout abgebrochen. Es wurde nichts berechnet.",
    generationQueued: "Generierung erfolgreich in die Warteschlange gestellt.",
    promptLoaded: "Prompt wurde in den AI Agent geladen.",
    styleProfilesUpdated: "Style Profiles aktualisiert.",
    gallery: {
      eyebrow: "Creator Assets",
      title: "Asset Gallery",
      description:
        "Prüfe generierte Visuals, verwalte Processing-Jobs, speichere Favoriten, regeneriere Prompts und lade deine besten Kampagnen-Assets herunter.",
    },
    characters: {
      eyebrow: "Wiederverwendbare Creative Direction",
      title: "Style Profiles",
      description:
        "Erstelle wiederverwendbare Visual Profiles für Appearance, Styling, Mood und Brand Direction für konsistente Ergebnisse.",
    },
    credits: {
      eyebrow: "Abrechnung",
      title: "Credits & Pläne",
      description:
        "Sieh dein Guthaben, verstehe die Credit-Nutzung (1 Standard-Bild = 1 Credit) und kaufe Starter-, Professional- oder Ultimate-Pakete per sicherem Stripe-Checkout.",
    },
  },
  compactCredits: {
    credits: "Credits",
    loadingCredits: "Credits werden geladen",
    creditsAvailable: "{count} Credits verfügbar",
    refreshCredits: "Credits aktualisieren",
    zeroCreditsHint:
      "Keine Credits mehr — öffne Credits, um ein Paket zu kaufen",
  },
  agent: {
    title: "Kampagnenfertige Visuals erstellen",
    subtitle:
      "Erzeuge Premium-Creator-Visuals, Produktshots und Social-Media-Kampagnen-Assets. Nutze Style Profiles für wiederverwendbare Creative Direction.",
    enterHint: "Enter zum Generieren · Shift+Enter für neue Zeile",
    promptPlaceholder: "Beschreibe das gewünschte Visual",
    agent: "Agent",
    styleProfileNone: "Style Profile: keins",
    loadingStyleProfiles: "Style Profiles werden geladen…",
    styleProfileAria: "Style Profile",
    socialFormat: "Social Format",
    standard: "Standard",
    styleProfile: "Style Profile",
    imageMode: "Bildmodus",
    imageModeIntro:
      "Wähle, wie der AI Agent Visuals erzeugt. Standard Image ist der Produktions-Default. Fast Draft ist optional, wenn es in deiner Umgebung aktiviert ist.",
    imageModeStandardActiveNote: "Standard Image · Live · 1 Credit",
    imageModeFastDraftActiveNote: "Fast Draft · Beta · 1 Credit",
    imageModePremiumActiveNote: "Premium Image · Beta · 3 Credits",
    imageModeReferenceEditActiveNote: "Reference Edit · Beta · 5 Credits",
    imageModeBrandAssetsActiveNote: "Brand Assets · Beta · 4 Credits",
    plannedExpansion: "Studio-Roadmap",
    imageModeActiveNote: "Standard Image · Live · 1 Credit",
    imageModeRoadmapLabel: "Ebenfalls auf der Studio-Roadmap",
    imageModeRoadmapNote:
      "Nur Vorschau — noch nicht an Generierung oder Abrechnung angebunden.",
    referenceEditMissingSource:
      "Lade ein Quellbild für Reference Edit hoch.",
    referenceEditMissingInstruction:
      "Füge Bearbeitungsanweisungen für Reference Edit hinzu.",
    studioRoadmapChips: [
      "Fast Draft Mode",
      "Premium Image Mode",
      "Reference Edit Mode",
      "Brand Assets",
      "Video Studio",
      "Lip Sync Studio",
      "Cinema Agent",
      "Omni Campaign Agent",
    ],
    imageModes: {
      standard: {
        label: "Standard Image",
        description:
          "Zuverlässige Kampagnenvisuals über den Produktions-Image-Workflow.",
      },
      fastDraft: {
        label: "Fast Draft",
        description:
          "Schnellere, günstigere Drafts für schnelle visuelle Exploration.",
      },
      premium: {
        label: "Premium Image",
        description:
          "Höherwertige Kampagnenvisuals für anspruchsvolle Creator-Assets.",
      },
      referenceEdit: {
        label: "Reference Edit",
        description:
          "Bild hochladen und präzise kampagnenfertige Bearbeitungen anleiten.",
        hoverHint:
          "Reference Edit unterstützt Quellbilder, Bearbeitungsanweisungen und geführte Kampagnen-Verfeinerungen.",
        panel: {
          statusPlanned: "Demnächst · Geplant",
          statusActive: "Beta",
          introPlanned:
            "Reference Edit wird für geführte Bildtransformationen vorbereitet.",
          introActive:
            "Lade ein Quellbild hoch und beschreibe die gewünschten Änderungen. Ergebnisse erscheinen im Agent und in der Galerie.",
          sourceLabel: "Quellbild",
          sourcePlaceholder: "Quellbild hochladen, um zu starten",
          sourceHint: "PNG, JPEG oder WebP · max. 12 MB",
          uploadSourceImage: "Quellbild hochladen",
          uploading: "Wird hochgeladen…",
          clearImage: "Bild entfernen",
          invalidFile: "Bitte JPEG, PNG oder WebP wählen.",
          fileTooLarge: "Bild zu groß (max. 12 MB).",
          uploadFailed: "Upload fehlgeschlagen. Bitte erneut versuchen.",
          instructionLabel: "Bearbeitungsanweisung",
          instructionPlaceholder:
            "Beschreibe die Änderung: Hintergrund, Licht, Produktdetails, Bildausschnitt…",
          previewLabel: "Ergebnis-Vorschau",
          previewPlaceholder:
            "Das bearbeitete Ergebnis erscheint hier nach der Generierung",
          generateDisabled: "Generieren — demnächst",
          generationNotActive:
            "Generierung noch nicht aktiv. Nutze unten Standard, Fast Draft oder Premium Image.",
          plannedNote:
            "Reference Edit wird für geführte Bildtransformationen vorbereitet. Upload und Anweisungen sind als Workflow-Vorschau verfügbar. Die Generierung ist noch nicht aktiv.",
          activeNote:
            "Reference Edit nutzt dein Quellbild und deine Anweisungen, um ein neues kampagnenfertiges Visual zu erstellen.",
        },
      },
      brandAssets: {
        label: "Brand Assets",
        description:
          "Erzeuge kampagnenfertige Ad Creatives, Produktlayouts und Brand Visuals.",
        hoverHint:
          "Brand Assets unterstützt Ad Creatives, Produktkampagnen-Layouts, Thumbnails und Social-Marketing-Visuals.",
      },
      live: "Live",
      beta: "Beta",
      oneCredit: "1 Credit",
      twoCredits: "2 Credits",
      threeCredits: "3 Credits",
      fourCredits: "4 Credits",
      fiveCredits: "5 Credits",
      planned: "Geplant",
      comingSoon: "Demnächst",
      plannedTooltip: "Geplant — in diesem Release nicht verfügbar",
    },
    modes: {
      auto: {
        label: "Auto",
        description: "Ausgewogene Creative Direction für die meisten Prompts.",
      },
      portrait: {
        label: "Portrait",
        description:
          "Ideal für Creator-Portraits, Editorials und personenbezogene Visuals.",
      },
      product: {
        label: "Product",
        description:
          "Ideal für Produktshots, Brand Visuals und Werbemotive.",
      },
      campaign: {
        label: "Campaign",
        description:
          "Ideal für Social Ads, Kampagnenkonzepte und Creator Marketing.",
      },
    },
    formats: {
      square: { label: "Quadrat", platform: "Allgemein", description: "Universal-Post" },
      tiktok: {
        label: "TikTok / Reels",
        platform: "TikTok",
        description: "Vertikales Short-Format",
      },
      instagram_post: {
        label: "Instagram Post",
        platform: "Instagram",
        description: "Feed Hochformat",
      },
      instagram_story: {
        label: "Instagram Story",
        platform: "Instagram",
        description: "Story-Format",
      },
      youtube_thumbnail: {
        label: "YouTube Thumb",
        platform: "YouTube",
        description: "Breites Thumbnail",
      },
      youtube_shorts: {
        label: "YouTube Shorts",
        platform: "YouTube",
        description: "Vertikale Shorts",
      },
    },
    latestResult: "Neuestes Ergebnis",
    generating: "Dein Bild wird generiert…",
    completed: "Generierung abgeschlossen",
    failed: "Generierung fehlgeschlagen",
    openImage: "Bild öffnen",
    viewInGallery: "In Gallery ansehen",
    createAnother: "Weiteres erstellen",
    processingHint:
      "Verarbeitung im Hintergrund. Das Bild erscheint hier automatisch.",
    processingStay:
      "Bitte warten, während InfluExAi dein Bild generiert und speichert. Auf dieser Seite bleiben — das Ergebnis erscheint automatisch.",
    currentJob: "Aktueller Job",
    imageUrlMissing: "Bild-URL fehlt",
    styleProfilesFooter:
      "Style Profiles leiten Look, Mood und Creative Direction.",
    preparingWithProfile:
      "Generierung mit {name} als Style Profile wird vorbereitet.",
    preparingFormat:
      "Generierung für {format} ({ratio}) wird vorbereitet.",
    queuedWithProfile:
      "Generierung mit {name} als Style Profile in Warteschlange.",
    describePrompt: "Bitte beschreibe, was du erstellen möchtest.",
    signInAgain: "Bitte erneut anmelden.",
    notEnoughCredits:
      "Nicht genug Credits. Bitte mehr Credits kaufen.",
    insufficientCreditsTitle: "Nicht genug Credits",
    insufficientCreditsIntro:
      "Nicht genug Credits für diese Generierung.",
    insufficientCreditsModeRequires: "Dieser Modus benötigt {count} Credits.",
    insufficientCreditsBuyMore:
      "Kaufe mehr Credits, um fortzufahren.",
    buyCredits: "Credits kaufen",
    openCredits: "Credits öffnen",
    profileNotFound: "Ausgewähltes Style Profile wurde nicht gefunden.",
    queueFailed:
      "Generierung konnte nicht gestartet werden. Bitte erneut versuchen.",
    noGenerationId:
      "Generierung eingereiht, aber keine Generierungs-ID erhalten.",
    networkError: "Netzwerkfehler. Bitte erneut versuchen.",
    creditsRefundedHint: "Credits wurden erstattet.",
    promptLoadedRegeneration: "Prompt für Regenerierung geladen.",
  },
  gallery: {
    loading: "Asset Gallery wird geladen...",
    empty: "Keine passenden Assets in deiner Gallery.",
    searchPlaceholder: "Prompts durchsuchen...",
    allStyleProfiles: "Alle Style Profiles",
    noStyleProfile: "Kein Style Profile",
    filterAll: "Alle",
    completed: "Abgeschlossen",
    processing: "In Bearbeitung",
    failed: "Fehlgeschlagen",
    favorites: "Favoriten",
    standard: "Standard",
    noStyleProfileShort: "kein Style Profile",
    creditOne: "1 Credit",
    creditsCount: "{count} Credits",
    processingLabel: "In Bearbeitung",
    generationFailed: "Generierung fehlgeschlagen",
    creditsRefundedHint: "Credits wurden erstattet.",
    unknownError: "Unbekannter Fehler",
    imageUnavailable: "Bild nicht verfügbar",
    noImageUrl: "Diese Generierung hat keine Bild-URL.",
    imageCouldNotLoad: "Bild konnte nicht geladen werden",
    renderFailed:
      "Die Datei existiert, aber die Gallery konnte sie nicht anzeigen.",
    openImageDirectly: "Bild direkt öffnen",
    loadMore: "Mehr laden",
    loadingMore: "Lädt...",
    deleteConfirm: "Diese Generierung dauerhaft löschen?",
    copied: "kopiert",
    inProgressTitle: "Generierung läuft",
    inProgressBody:
      "Die Gallery aktualisiert sich automatisch, während dein Bild erstellt wird.",
    modalUnavailableTitle: "Bild nicht verfügbar",
    modalUnavailableBody:
      "Diese Generierung hat keine gültige Bild-URL oder konnte in der Gallery nicht angezeigt werden.",
    prompt: "Prompt",
    finalPrompt: "Finaler Prompt",
    error: "Fehler",
    copyPrompt: "Prompt kopieren",
    copyFinalPrompt: "Finalen Prompt kopieren",
    deleteGeneration: "Generierung löschen",
    regenerate: "Regenerieren",
    addFavorite: "Zu Favoriten hinzufügen",
    removeFavorite: "Aus Favoriten entfernen",
    openDownloadImage: "Bild öffnen / herunterladen",
    processingHint:
      "Dein Bild wird generiert. Die Gallery aktualisiert sich automatisch.",
  },
  styleProfiles: {
    loading: "Style Profiles werden geladen...",
    brandDirection: "Brand & Creator Direction",
    disclaimer:
      "Style Profiles leiten Look, Mood, Styling und Brand Direction. Sie sind keine festen Identity-Models.",
    newProfile: "Neues Style Profile",
    buildDirection: "Neues Style Profile",
    buildDescription:
      "Baue wiederverwendbare Creative Direction für Kampagnenvisuals — Appearance, Mood und Brand Styling in einem Profil.",
    profileName: "Profilname",
    profileNamePlaceholder: "z. B. Luxury Fitness Creator",
    creativeTag: "Creative Tag (optional)",
    creativeTagPlaceholder: "z. B. Editorial · Product",
    profileSummary: "Profil-Zusammenfassung",
    profileSummaryPlaceholder:
      "Kurze Beschreibung der kreativen Rolle dieses Profils...",
    creativeDirection: "Creative Direction",
    appearanceDirection: "Appearance Direction",
    appearancePlaceholder: "Haar, Wardrobe, Framing, Signature Look...",
    styleDirection: "Style Direction",
    stylePlaceholder: "Licht, Objektiv, Color Grading, Mood, Brand Aesthetic...",
    creating: "Wird erstellt...",
    createProfile: "Style Profile erstellen",
    emptyTitle: "Noch keine Style Profiles",
    emptyBody:
      "Erstelle dein erstes Style Profile und lade Visual References hoch, um Look und Mood im AI Agent zu steuern.",
    styleProfileBadge: "Style Profile",
    coverReference: "Cover Reference",
    noCoverYet: "Noch keine Cover Reference",
    noCoverHint:
      "Lade eine Visual Reference hoch — das erste Bild wird die Cover Reference.",
    noSummary: "Noch keine Profil-Zusammenfassung.",
    removeProfile: "Profil entfernen",
    notDefined: "Noch nicht definiert.",
    visualReferences: "Visual References",
    uploadHint:
      "Lade Visual References hoch, um Look und Mood des Profils zu steuern.",
    referenceCount: "{count} Visual Reference",
    referenceCountPlural: "{count} Visual References",
    uploadReference: "Reference hochladen",
    uploading: "Wird hochgeladen…",
    addReferences: "Visual References hinzufügen",
    addReferencesHint:
      "Lade Mood Frames, Produktshots oder Kampagnen-Stills hoch. Der erste Upload wird die Cover Reference.",
    chooseImage: "Bild wählen",
    setCoverReference: "Als Cover Reference setzen",
    removeReference: "Visual Reference entfernen",
    deleteProfileConfirm:
      "Dieses Style Profile und alle Visual References löschen?",
    deleteReferenceConfirm: "Diese Visual Reference löschen?",
    created: "Style Profile erstellt.",
    deleted: "Style Profile gelöscht.",
    referenceUploaded: "Visual Reference hochgeladen.",
    coverUpdated: "Cover Reference aktualisiert.",
    referenceDeleted: "Visual Reference gelöscht.",
    nameRequired: "Profilname ist erforderlich.",
    loadFailed: "Style Profiles konnten nicht geladen werden.",
    createFailed: "Style Profile konnte nicht erstellt werden.",
    deleteFailed: "Style Profile konnte nicht gelöscht werden.",
    uploadFailed: "Visual Reference konnte nicht hochgeladen werden.",
    coverFailed: "Cover Reference konnte nicht gesetzt werden.",
    referenceDeleteFailed: "Visual Reference konnte nicht gelöscht werden.",
    signInAgain: "Bitte erneut anmelden.",
  },
  credits: {
    accountBalance: "Kontoguthaben",
    creditsTitle: "Credits",
    balanceDescription:
      "Credits werden beim Generieren von Bildern im AI Agent verwendet. Jedes Standard-Bild verbraucht einen Credit.",
    modeUsageIntro:
      "Credits werden je nach gewähltem Modus verbraucht.",
    modeCosts: {
      standard: "Standard Image: 1 Credit",
      fastDraft: "Fast Draft: 1 Credit",
      premium: "Premium Image: 3 Credits",
      referenceEdit: "Reference Edit: 5 Credits",
      brandAssets: "Brand Assets: 4 Credits",
    },
    oneCreditRule: "1 Standard-Bild = 1 Credit",
    availableCredits: "Verfügbare Credits",
    refreshing: "Guthaben wird aktualisiert…",
    refreshBalance: "Guthaben aktualisieren",
    creditPackages: "Credit-Pakete",
    choosePlan: "Wähle einen Plan für deinen Workflow",
    secureCheckout: "Sichere Zahlung über Stripe",
    price: "Preis",
    creditsIncluded: "Enthaltene Credits",
    creditsUnit: "Credits",
    standardImages:
      "≈ {count} Standard-Bilder (1 Bild = 1 Credit)",
    redirecting: "Weiterleitung zum Checkout…",
    footerNote:
      "Credits werden nach erfolgreicher Zahlung gutgeschrieben. Ungenutzte Credits bleiben auf deinem Guthaben, bis sie im AI Agent verwendet werden.",
    recommended: "Empfohlen",
    sessionExpired: "Deine Sitzung ist abgelaufen. Bitte erneut anmelden.",
    loadFailed:
      "Dein Credit-Guthaben konnte nicht geladen werden. Bitte erneut versuchen.",
    loadConnection:
      "Dein Credit-Guthaben konnte nicht geladen werden. Verbindung prüfen und erneut versuchen.",
    checkoutFailed:
      "Checkout konnte nicht gestartet werden. Bitte gleich erneut versuchen.",
    checkoutNoUrl:
      "Checkout konnte nicht gestartet werden. Kein Zahlungslink erhalten.",
    checkoutConnection:
      "Checkout konnte nicht gestartet werden. Verbindung prüfen und erneut versuchen.",
    watermarkedPromo: {
      eyebrow: "Geplante Monetarisierung",
      title: "Watermarked Promo-Paket",
      badge: "Geplant",
      description:
        "Watermarked Promo-Exporte — geplant. Günstige Exporte mit sichtbarem InfluExAi-Wasserzeichen zum Testen und für Brand Discovery.",
      upgradeNote:
        "Später Upgrade für Export ohne Wasserzeichen.",
      notAvailable:
        "In diesem Release nicht kaufbar. Starter, Professional und Ultimate bleiben die aktiven Pakete.",
    },
    features: {
      aiAgent: "AI Agent",
      socialFormats: "Social Formats",
      styleProfiles: "Style Profiles",
      assetGallery: "Asset Gallery",
    },
    packages: {
      starter: {
        tagline: "Zum Testen",
        description:
          "Teste Prompts, Formate und Gallery-Workflows, bevor du die Produktion skalierst.",
        benefits: [
          "AI Agent Bildgenerierung",
          "Social-Media-Format-Presets",
          "Asset Gallery Speicher",
          "Ideal zum Testen und für erste Ideen",
        ],
        button: "Starter kaufen",
      },
      professional: {
        tagline: "Empfohlen für regelmäßige Creator",
        description:
          "Das ausgewogene Paket für konsistente Kampagnen und wiederverwendbare Creative Direction.",
        benefits: [
          "Alles aus Starter",
          "Style Profiles für wiederverwendbare Direction",
          "Für regelmäßige Creator-Workflows",
          "Bestes Preis-Leistungs-Verhältnis",
        ],
        button: "Professional kaufen",
      },
      ultimate: {
        tagline: "Für High-Volume-Workflows",
        description:
          "Skaliere Content-Produktion mit großem Credit-Reserve für Teams und Heavy Usage.",
        benefits: [
          "Alles aus Professional",
          "High-Volume Bildgenerierung",
          "Für Agenturen und Power User",
          "Maximale Reichweite pro Kauf",
        ],
        button: "Ultimate kaufen",
      },
    },
  },
};

export const dashboardCopy = { en, de } as const;

export type DashboardCopy = DeepString<typeof en>;

export function getDashboardCopy(language: DashboardLanguage): DashboardCopy {
  return dashboardCopy[language];
}

/** Simple `{name}` placeholder replacement. */
export function formatCopy(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}
