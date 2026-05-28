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
      "Campaign orchestration and compliance tools — coming in a future release.",
    expansionFootnote:
      "Planned modules stay disabled until a future release.",
    roadmap: "Roadmap",
    roadmapBody:
      "Pick an image mode inside the AI Agent. Video, lip sync and campaign agents ship in later expansion releases.",
    watermarkedPromoTitle: "Watermarked Promo Package",
    watermarkedPromoBadge: "Planned",
    watermarkedPromoBody:
      "Low-cost watermarked exports for early testing and brand discovery — planned monetization module, not live yet. Upgrade later to export without watermark.",
    home: "Home",
    logout: "Logout",
    studioMenu: "Studio Menu",
    live: "Live",
    beta: "Beta",
    comingSoon: "Coming soon",
    planned: "Planned",
    roadmapBadge: "Roadmap",
    moduleUnavailable: "Not available in the current release.",
    creativeModes: "Creative Modes",
    creativeModesHint:
      "Image, video and lip-sync workflows run in the AI Agent. Credits apply per selected mode.",
    expansionPlanned: "Expansion / Planned",
    expansionPlannedHint:
      "Image modes run in the AI Agent. Open Tools for the full studio roadmap.",
    creditCostShort: "Credits",
    toolRailStatuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Soon",
      planned: "Planned",
    },
    toolRail: {
      sectionTitle: "Studio tools",
      plannedSectionTitle: "Planned",
      imageStudio: "Image Studio",
      imageStudioTip: "Create campaign-ready stills for social, ads and products",
      videoStudio: "Video Studio",
      videoStudioTip: "Turn static visuals into short-form campaign videos",
      lipSync: "Lip Sync",
      lipSyncTip: "Talking-head creator videos with voice and source video",
      creatorVideo: "Creator Video",
      creatorVideoTip: "One image and prompt into a short AI creator video",
      talkingCreator: "Talking Creator",
      talkingCreatorTip: "Talking clip from image, script and voice",
      motionTransfer: "Motion Transfer",
      motionTransferTip: "Animate a creator image with a driving video",
      brandAssets: "Brand Assets",
      brandAssetsTip: "Brand-aligned campaign visuals and product layouts",
      referenceEdit: "Reference Edit",
      referenceEditTip: "Guide results with a reference image",
      cinemaAgent: "Cinema Agent",
      cinemaAgentTip: "Plan scenes and shot lists before generating",
      omniAgent: "Omni Campaign Agent",
      omniAgentTip: "One brief into visuals, video concepts and captions",
      socialPlanner: "Social Planner",
      socialPlannerTip: "Plan captions, hashtags and posting calendars",
      compliance: "Compliance",
      complianceTip: "Review claims, logos and brand safety",
      watermark: "Watermark",
      watermarkTip: "Watermarked promo previews for concept testing",
    },
    nav: {
      home: { label: "Home", description: "Dashboard overview" },
      agent: { label: "AI Agent", description: "Create campaign visuals" },
      tools: {
        label: "Tools",
        description: "Explore workflows",
      },
      gallery: { label: "Asset Gallery", description: "Manage generated assets" },
      characters: {
        label: "Style Profiles",
        description: "Save reusable styles",
      },
      credits: { label: "Credits", description: "Balance and plans" },
      planner: {
        label: "Campaign Planner",
        description:
          "Plan campaign concepts, shot lists, captions, schedules and safety checks before generating assets.",
      },
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
        activeNote:
          "Active now: Campaign Planner in Live Studio (Planning Beta)",
      },
      omniCampaignAgent: {
        label: "Omni Campaign Agent",
        description:
          "Turn a campaign idea into visuals, video concepts, captions and export-ready assets.",
      },
      socialPlanner: {
        label: "Social Planner",
        description:
          "Plan posts and campaign calendars for upcoming campaigns.",
      },
      brandSafety: {
        label: "Brand Safety / Compliance",
        description:
          "Policy checks and compliance hints for campaign assets.",
      },
    },
  },
  dashboardNav: {
    dashboard: { label: "Dashboard", sublabel: "Overview" },
    createStudio: {
      label: "AI Create Studio",
      sublabel: "Create assets",
      workspaceTitle: "AI Create Studio",
      workspaceSubline:
        "Pick a mode — image, video or lip sync — and generate in one focused workspace.",
      tabImage: "Image",
      tabVideo: "Video",
      tabLipSync: "Lip Sync",
    },
    gallery: { label: "Asset Gallery", sublabel: "Manage assets" },
    styleProfiles: { label: "Style Profiles", sublabel: "Reusable styles" },
    credits: { label: "Credits / Billing", sublabel: "Plans and balance" },
    upcoming: { label: "Upcoming", sublabel: "Future tools" },
    topBar: {
      welcome: "Welcome back, Georgios! 👋",
      subline: "Ready to create your next campaign asset?",
      searchPlaceholder: "Search assets, templates or workflows…",
      creditsAvailable: "{count} Credits available",
      addCredits: "Add Credits",
    },
  },
  studioSuite: {
    title: "Studio Modes",
    description:
      "Choose the right workflow for your campaign asset. Credits are charged based on the selected mode.",
    workflowChargeNote:
      "Credits are charged based on the selected workflow.",
    creditCost: "Credit Cost",
    bestFor: "Best for",
    status: "Status",
    tool: "Tool",
    modes: {
      standard: {
        label: "Standard Image",
        credits: "1 Credit",
        bestFor: "Reliable campaign visuals",
      },
      ugcLook: {
        label: "UGC Look",
        credits: "2 Credits",
        bestFor: "Organic social content",
      },
      fastDraft: {
        label: "Fast Draft",
        credits: "1 Credit",
        bestFor: "Quick visual exploration",
      },
      premium: {
        label: "Premium Image",
        credits: "3 Credits",
        bestFor: "Higher-quality campaign visuals",
      },
      referenceEdit: {
        label: "Reference Edit",
        credits: "5 Credits",
        bestFor: "Guided image edits",
      },
      brandAssets: {
        label: "Brand Assets",
        credits: "4 Credits",
        bestFor: "Ad creatives and product visuals",
      },
      videoStudio: {
        label: "Video Studio",
        credits: "25 Credits",
        bestFor: "Image-to-video creator clips",
      },
      lipSync: {
        label: "Lip Sync Studio",
        credits: "30 Credits",
        bestFor: "Talking creator clips",
      },
    },
    planned: {
      cinemaAgent: {
        label: "Cinema Agent",
        bestFor: "Shot planning and scene briefs",
      },
      omniCampaignAgent: {
        label: "Omni Campaign Agent",
        bestFor: "Cross-channel campaign orchestration",
      },
      socialPlanner: {
        label: "Social Planner",
        bestFor: "Content calendars and post planning",
      },
      brandSafety: {
        label: "Brand Safety / Compliance",
        bestFor: "Policy and compliance review",
      },
      watermarkedPromo: {
        label: "Watermarked Promo Package",
        bestFor: "Low-cost watermarked exports",
      },
    },
  },
  campaignPlanner: {
    title: "Campaign Planner",
    subtitle: "Cinema Agent · Planning Beta",
    intro:
      "Plan campaign concepts, shot lists, captions, schedules and safety checks before generating assets. This preview runs entirely in your browser — no credits, no provider calls.",
    badges: {
      planningBeta: "Planning Beta",
      noCredits: "No credits used",
      manualRequired: "Manual generation only",
      batchPlanned: "Batch generation planned",
      planned: "Planned",
    },
    estimate: {
      title: "Campaign Estimate",
      intro:
        "Preview only — no credits are deducted. Use individual prompts in the AI Agent until batch generation ships.",
      estimatedCredits: "Estimated credits",
      totalEstimated: "Total estimated credits",
      futureEstimate: "Future estimate",
      batchNote:
        "Batch generation is planned. You can currently generate selected prompts manually in the AI Agent.",
      lineItems: {
        stories: "Story images",
        feedPosts: "Feed post images",
        reel: "Reel / Short video",
        shots: "Shot card images",
      },
      counts: {
        storyIdeas: "Story ideas",
        feedPosts: "Feed post ideas",
        reelShort: "Reel / Short ideas",
        shotCards: "Shot cards",
      },
      creditsPerUnit: "{count} × {credits} credit(s)",
      creditsPerUnitPlural: "{count} × {credits} credits",
    },
    socialPlanner: {
      title: "Social Planner Preview",
      intro:
        "Suggested posting order for manual publishing. No platform connection, no automatic scheduling.",
      suggestedPostingOrder: "Suggested posting order",
      suggestedDays: "Day",
      timeWindow: "Time window",
      captionsLabel: "Captions",
      hashtagsLabel: "Hashtags",
      platformFit: "Platform fit",
      manualPosting: "Manual posting",
      noSocialApi: "No social API connected",
      copySchedule: "Copy schedule",
      copyCaptions: "Copy captions",
      scheduleAutomatically: "Schedule automatically",
      scheduleAutoHint:
        "Automatic scheduling requires platform API review and explicit user authorization.",
      platforms: {
        instagramFeed: "Instagram Feed",
        instagramStory: "Instagram Story",
        tiktokReels: "TikTok / Reels",
        youtubeShorts: "YouTube Shorts",
      },
      slots: {
        launchVisual: "Launch visual",
        behindTheScenes: "Behind-the-scenes angle",
        shortHook: "Short hook video idea",
        engagementStory: "Engagement story beat",
        recapClip: "Recap clip",
      },
      platformFitNotes: {
        instagramFeed: "Hero stills, product focus, campaign launch posts",
        instagramStory: "BTS, polls, quick proof points",
        tiktokReels: "Vertical motion, hook-first short clips",
        youtubeShorts: "Recap, teaser, CTA-friendly vertical cut",
      },
      dayLine: "Day {day} — {platform} — {content} — {time}",
    },
    brandSafety: {
      title: "Brand Safety Preview",
      intro:
        "This is a manual pre-publish checklist. Automated compliance scanning is planned.",
      checklistTitle: "Pre-publish brand safety checklist",
      copyChecklist: "Copy checklist",
      runAutomatedScan: "Run automated scan",
      runScanHint:
        "Automated scanning requires computer vision model validation and legal review before activation.",
      badges: {
        manualChecklist: "Manual checklist",
        noAutomatedScan: "No automated scan",
        compliancePlanned: "Compliance planned",
      },
      items: {
        aiDisclosure: {
          label: "AI content disclosure reminder",
          description:
            "Add an AI or synthetic media disclosure where required by your brand guidelines or jurisdiction.",
        },
        readableText: {
          label: "Check for unintended readable text",
          description:
            "Scan visuals for stray readable words, UI fragments or artifacts that could be confusing or off-brand.",
        },
        fakeLogos: {
          label: "Check for fake logos or brand names",
          description:
            "Ensure there are no unintended third-party logos, trademarks or brand names that you do not own.",
        },
        handsFaces: {
          label: "Check hands, fingers and facial details",
          description:
            "Review hands, fingers, faces and expressions for realism and potential artifacts before publishing.",
        },
        productClaims: {
          label: "Check product claims and legal wording",
          description:
            "Verify that any claims, offers or guarantees in captions and overlays are accurate and approved by legal.",
        },
        usageRights: {
          label: "Confirm usage rights for assets",
          description:
            "Confirm you hold the rights to use all uploaded, reference and stock assets in the planned campaign.",
        },
        platformCompliance: {
          label: "Confirm platform compliance before posting",
          description:
            "Cross-check the campaign against platform ad policies, sensitive content rules and age restrictions.",
        },
        watermarkDisclosure: {
          label: "Watermark / disclosure note if applicable",
          description:
            "Add a watermark or disclosure note if your brand, platform or jurisdiction requires it for AI content.",
        },
      },
    },
    exportPackage: {
      title: "Export Package Preview",
      intro:
        "Export packages are planned. You can currently copy the campaign plan manually.",
      packageContents: "Package contents",
      copyFullPlan: "Copy full campaign plan",
      copyShotPrompts: "Copy shot prompts",
      copyCaptions: "Copy captions",
      exportPdfZip: "Export as PDF / ZIP",
      exportPdfZipHint:
        "PDF and ZIP export are planned. Future packages will include campaign brief, prompts, captions, schedule and safety checklist.",
      fullPlanHeader: "InfluExAi — Campaign Plan Export",
      campaignBriefSection: "Campaign brief",
      socialScheduleSection: "Social schedule",
      socialScheduleUnavailable: "Social schedule not available.",
      brandSafetySection: "Brand safety checklist",
      shotLabel: "Shot",
      captionLabel: "Caption",
      badges: {
        manualExport: "Manual export",
        pdfZipPlanned: "PDF/ZIP planned",
      },
      contents: {
        campaignBrief: "Campaign brief",
        shotPrompts: "Shot prompts",
        captions: "Captions",
        hashtags: "Hashtags",
        socialSchedule: "Social schedule",
        brandSafetyChecklist: "Brand safety checklist",
      },
    },
    fields: {
      campaignIdea: "Campaign idea",
      productBrand: "Product / brand",
      platformFocus: "Platform focus",
      goal: "Goal",
    },
    placeholders: {
      campaignIdea:
        "Describe the campaign: audience, offer, mood and key message…",
      productBrand: "Brand or product name",
    },
    platforms: {
      instagram: "Instagram",
      tiktok: "TikTok / Reels",
      youtube: "YouTube",
      linkedin: "LinkedIn",
      multi: "Multi-platform",
    },
    goals: {
      awareness: "Brand awareness",
      engagement: "Engagement",
      conversion: "Conversion",
      launch: "Product launch",
    },
    formats: {
      instagram: "4:5 Feed / 9:16 Story",
      tiktok: "9:16 Vertical",
      youtube: "16:9 Thumbnail / Shorts",
      linkedin: "1:1 or 4:5 Professional",
      multi: "Square + Vertical mix",
    },
    generatePlan: "Generate campaign plan",
    planningPreviewNote: "Planning Beta · no credits used · client-side only",
    sections: {
      campaignAngle: "Campaign Angle",
      contentSet: "Content Set",
      shotList: "Shot List",
      captions: "Captions",
      hashtags: "Hashtag ideas",
      nextSteps: "Next Steps",
    },
    contentSet: {
      stories: "3 Story ideas",
      feedPosts: "2 Feed post ideas",
      reel: "1 Reel / Short video idea",
    },
    shotCard: {
      imagePrompt: "Suggested image prompt",
      videoMotion: "Suggested video motion",
    },
    actions: {
      copyPrompt: "Copy prompt",
      copyCaption: "Copy caption",
      copyHashtags: "Copy hashtags",
      copied: "Copied",
      useInAgent: "Use in AI Agent",
      generateFullCampaign: "Generate full campaign",
      generateFullCampaignHint:
        "Batch generation is planned. You can currently generate selected prompts manually in the AI Agent.",
    },
    nextSteps: [
      "Copy image prompts into the AI Agent for Standard or Premium Image.",
      "Use Video Studio motion prompts for short-form clips.",
      "Refine captions before publishing — no auto-posting in this preview.",
    ],
    defaults: {
      brandFallback: "your brand",
      ideaFallback: "your campaign concept",
    },
    hashtagSeeds: [
      "#{brand}",
      "#CreatorMarketing",
      "#BrandCampaign",
      "#SocialAds",
      "#ContentStrategy",
      "#VisualStorytelling",
      "#DigitalMarketing",
      "#InfluencerStyle",
    ],
    templates: {
      angleAwareness:
        "Position {brand} for top-of-funnel awareness on {platform}: lead with the idea \"{idea}\" and a premium, scroll-stopping visual identity aligned with {goal}.",
      angleEngagement:
        "Drive conversation around {brand} on {platform} by framing \"{idea}\" as a relatable creator moment — optimized for saves, shares and comments ({goal}).",
      angleConversion:
        "Convert attention for {brand} on {platform}: pair \"{idea}\" with clear product proof, social proof and a single focused call-to-action ({goal}).",
      angleLaunch:
        "Launch narrative for {brand}: introduce \"{idea}\" with cinematic reveal energy on {platform}, building anticipation toward {goal}.",
      story1:
        "Behind-the-scenes: how {brand} prepares the drop tied to \"{idea}\" — authentic, handheld Story framing.",
      story2:
        "Quick poll or question sticker: audience opinion on the {goal} angle for \"{idea}\".",
      story3:
        "Social proof slide: customer or creator reaction highlighting why \"{idea}\" matters for {brand}.",
      feed1:
        "Hero still for {brand}: premium commercial lighting, product or creator focal point supporting \"{idea}\".",
      feed2:
        "Lifestyle context shot: {brand} in real-world use, editorial color grade, campaign-ready composition.",
      reelIdea:
        "15–30s vertical beat: open on detail macro, reveal full scene, end on logo or offer — motion supports \"{idea}\" for {platform}.",
      shot1Title: "Hero opening",
      shot2Title: "Product focus",
      shot3Title: "Creator moment",
      shot4Title: "Environment wide",
      shot5Title: "Closing CTA frame",
      shot1Direction:
        "Cinematic opener — confident subject, premium key light, shallow depth of field.",
      shot2Direction:
        "Tight product or offer frame — clean background, brand-forward styling.",
      shot3Direction:
        "Creator portrait energy — authentic expression, on-brand wardrobe.",
      shot4Direction:
        "Wide lifestyle context — environment supports the campaign narrative.",
      shot5Direction:
        "Closing frame with space for headline or CTA overlay — balanced negative space.",
      shot1ImagePrompt:
        "Premium campaign visual for {brand}, concept: {idea}, cinematic commercial lighting, high-end social ad aesthetic, sharp focus, no text, no logo.",
      shot2ImagePrompt:
        "Product-focused campaign shot for {brand}, {idea}, studio-softbox lighting, clean composition, luxury advertising style, no text.",
      shot3ImagePrompt:
        "Creator portrait for {brand} campaign, {idea}, editorial fashion lighting, confident mood, realistic skin texture, no text.",
      shot4ImagePrompt:
        "Wide lifestyle scene for {brand}, {idea}, natural environment, golden-hour or studio-mixed light, campaign photography, no text.",
      shot5ImagePrompt:
        "Closing campaign frame for {brand}, {idea}, balanced composition with negative space for copy, premium commercial finish, no text.",
      shot1VideoPrompt:
        "Slow push-in, subtle parallax, premium campaign energy.",
      shot2VideoPrompt:
        "Gentle orbit around product, light sweep across surface.",
      shot3VideoPrompt:
        "Subtle head turn, soft hair movement, editorial portrait motion.",
      shot4VideoPrompt:
        "Slow pan across scene, atmospheric depth, cinematic pacing.",
      shot5VideoPrompt:
        "Fade-in logo area hold, minimal camera drift, confident end beat.",
      caption1:
        "{brand}: {idea} — built for {platform}. Discover the story behind the campaign.",
      caption2:
        "New from {brand}. {idea} — crafted for {goal}. See the full visual set in feed.",
      caption3:
        "Your next scroll-stopper from {brand}. {idea} — premium visuals, ready for {platform}.",
    },
  },
  page: {
    checkoutSuccess:
      "Payment successful. Your credits have been added to your balance.",
    checkoutCancelled: "Checkout was cancelled. No charges were made.",
    generationQueued: "Generation queued successfully.",
    promptLoaded: "Prompt loaded back into the AI Agent.",
    campaignPromptLoaded: "Campaign prompt loaded into AI Agent.",
    styleProfilesUpdated: "Style profiles updated.",
    gallery: {
      eyebrow: "Creator Assets",
      title: "Asset Gallery",
      description:
        "Manage every generated visual in one place — from drafts and processing jobs to favorites, downloads and final campaign assets.",
    },
    characters: {
      eyebrow: "Reusable Creative Direction",
      title: "Style Profiles",
      description:
        "Create reusable profiles that guide look, mood and styling for more consistent outputs.",
    },
    credits: {
      eyebrow: "Billing",
      title: "Credits & Plans",
      description:
        "View your balance, understand mode costs, and buy credit packages via secure Stripe checkout.",
    },
    planner: {
      eyebrow: "Campaign Planning",
      title: "Campaign Planner",
      description:
        "Create structured campaign plans, shot prompts, captions, social schedules and safety checklists before generating assets.",
    },
    tools: {
      eyebrow: "Creator Platform",
      title: "Tools",
      description:
        "Choose the right creative workflow for your next campaign — from image generation and reusable styles to upcoming video, planning and brand safety tools.",
    },
  },
  toolsPage: {
    openInAgent: "Open in Agent",
    includedModes: "Included modes",
    roadmapOnly: "Planned workflow",
    statuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Coming soon",
      planned: "Planned",
    },
    imageModes: {
      standard: "Standard",
      fastDraft: "Fast Draft",
      ugcLook: "UGC Look",
      premium: "Premium",
      brandAssets: "Brand Assets",
      referenceEdit: "Reference Edit",
    },
    cards: {
      imageStudio: {
        title: "Image Studio",
        benefit:
          "Campaign-ready stills with six image workflows — standard, draft, UGC, premium, brand and reference edit.",
      },
      videoStudio: {
        title: "Video Studio",
        benefit:
          "Turn static visuals into short-form campaign videos for social media, product launches and creator ads.",
      },
      creatorVideo: {
        title: "Creator Video",
        benefit:
          "Turn a source image and prompt into a short AI creator video.",
      },
      lipSync: {
        title: "Lip Sync Studio",
        benefit:
          "Create talking-head creator videos from scripts, voices and visual assets — ideal for UGC-style campaigns.",
      },
      talkingCreator: {
        title: "Talking Creator",
        benefit:
          "Create a talking creator clip from one image, script and voice.",
      },
      cinemaAgent: {
        title: "Cinema Agent",
        benefit:
          "Scene lists, shot planning and visual sequences before generation.",
      },
      omniCampaign: {
        title: "Omni Campaign Agent",
        benefit:
          "One brief into visuals, video concepts, captions and export-ready assets.",
      },
      socialPlanner: {
        title: "Social Planner",
        benefit:
          "Plan captions, hashtags and posting calendars for upcoming campaigns.",
      },
      compliance: {
        title: "Compliance Check",
        benefit:
          "Pre-publish checklist for claims, logos, disclosure and brand safety.",
      },
      watermarkedPromo: {
        title: "Watermarked Promo Package",
        benefit:
          "Low-cost watermarked exports for testing — full export upgrade planned.",
      },
    },
  },
  home: {
    chooseStudio: "Choose your studio",
    chooseStudioSubline:
      "Start with images, turn assets into videos or create talking creator clips.",
    eyebrow: "Creator Command Center",
    welcome: "Welcome back, Georgios",
    intro:
      "Create your next campaign visual, continue recent assets or manage your creative workflow.",
    createVisual: "Create Visual",
    useTemplate: "Use Template",
    addCredits: "Add Credits",
    promptPlaceholder:
      "Search templates or describe your next campaign visual…",
    promptCreate: "Create",
    studioToolsTitle: "Studio workflows",
    templatesTitle: "Start with a template",
    templatesSubtitle:
      "Proven prompts for fitness, beauty, UGC, product, restaurant and brand campaigns.",
    useTemplateCta: "Use Template",
    recentAssetsTitle: "Recent Assets",
    recentAssetsBody: "Continue working with your latest campaign visuals.",
    recentAssetsEmpty:
      "No assets yet. Create your first campaign visual in the AI Create Studio.",
    createFirstVisual: "Open Image Studio",
    quickActionsPills: {
      useTemplate: "Use Template",
      viewGallery: "View Gallery",
      createStyleProfile: "Create Style Profile",
      addCredits: "Add Credits",
    },
    assetOpen: "Open",
    assetVariant: "Create Variant",
    assetReference: "Use as Reference",
    assetDownload: "Download",
    statuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Coming soon",
    },
    metrics: {
      credits: "Credits Available",
      assets: "Assets Created",
      favorites: "Favorites",
      profiles: "Style Profiles",
      enoughFor: "Enough for up to {count} standard images.",
    },
    toolCards: {
      open: "Open Studio",
      start: "Open Studio",
      comingSoon: "Coming soon",
      imageStudio: {
        title: "Image Studio",
        body: "Create campaign-ready visuals for social media, ads, product campaigns and creator content.",
      },
      videoStudio: {
        title: "Video Studio",
        body: "Turn static visuals into short-form campaign videos for social media, launches and creator campaigns.",
      },
      lipSync: {
        title: "Lip-Sync Studio",
        body: "Create talking creator clips from source videos, scripts, voices or uploaded audio.",
      },
      creatorVideo: {
        title: "Creator Video",
        body: "Turn one source image and prompt into a short AI creator video.",
      },
      talkingCreator: {
        title: "Talking Creator",
        body: "Create a talking creator clip from one image, script and voice.",
      },
      motionTransfer: {
        title: "Motion Transfer",
        body: "Animate a creator image using a driving video.",
      },
    },
    quickActions: [
      {
        title: "Create Campaign Visual",
        body: "Generate a ready-to-use image for social media, ads, product campaigns or creator content.",
        cta: "Open AI Agent",
      },
      {
        title: "Start with Template",
        body: "Choose a proven prompt template for fitness, beauty, UGC, product, restaurant or brand campaigns.",
        cta: "Browse Templates",
      },
      {
        title: "Create Style Profile",
        body: "Save a reusable creative direction for consistent future generations.",
        cta: "Create Profile",
      },
      {
        title: "Continue Recent Assets",
        body: "Open your latest visuals, create variants or use an asset as reference.",
        cta: "Open Gallery",
      },
      {
        title: "Add Credits",
        body: "Top up your balance and continue generating campaign visuals.",
        cta: "View Plans",
      },
    ],
    recommended: {
      title: "Recommended next step",
      createProfile:
        "Create a reusable Style Profile before your next generation to keep your visuals consistent.",
      createProfileCta: "Create Style Profile",
      lowCreditsTitle: "Your credits are running low",
      lowCreditsBody:
        "Add credits now to continue generating campaign visuals without interruption.",
      lowCreditsCta: "Add Credits",
      variantTitle: "Turn your best result into variations",
      variantBody:
        "Use your latest favorite as a reference and generate a new campaign direction.",
      variantCta: "Create Variant",
    },
    heroTitle: "What do you want to create today?",
    heroSubtitle:
      "Choose a workflow, start from a prompt or continue working with your latest assets.",
  },
  toolRail: {
    home: "Home",
    imageStudio: "Image Studio",
    videoStudio: "Video Studio",
    lipSync: "Lip Sync",
    creatorVideo: "Creator Video",
    talkingCreator: "Talking Creator",
    motionTransfer: "Motion Transfer",
    gallery: "Asset Gallery",
    styleProfiles: "Style Profiles",
    credits: "Credits",
    toolsOverview: "Tools",
    plannedSection: "Planned",
    cinemaAgent: "Cinema Agent",
    omniAgent: "Omni Campaign Agent",
    socialPlanner: "Social Planner",
    compliance: "Compliance",
    watermark: "Watermark",
  },
  workspaces: {
    statuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Coming soon",
      planned: "Planned",
    },
    modelTitle: "Model",
    image: {
      eyebrow: "Image Studio",
      title: "Image Studio",
      subtitle:
        "Create campaign-ready visuals for social media, ads, product campaigns and creator content.",
      headline: "Create your next campaign visual.",
    },
    video: {
      eyebrow: "Video Studio",
      title: "Video Studio",
      subtitle: "Turn a source image into a short-form campaign video.",
      headline: "Generate your campaign video.",
      modelName: "Kling Image-to-Video",
      modelId: "fal-ai/kling-video/v2.1/standard/image-to-video",
      credits: "25 Credits",
      addSourceImage: "Add Source Image",
      motionPrompt: "Motion Prompt",
      generateVideo: "Generate Video",
    },
    lip_sync: {
      eyebrow: "Lip Sync Studio",
      title: "Lip Sync Studio",
      subtitle:
        "Create talking-head creator videos from a source video and voice.",
      headline: "Generate your lip sync video.",
      modelName: "Sync Lip Sync Pro",
      modelId: "fal-ai/sync-lipsync/v2/pro",
      credits: "30–35 Credits",
      addSourceVideo: "Add Source Video",
      generateLipSync: "Generate Lip Sync",
    },
    creator_video: {
      eyebrow: "Creator Video",
      title: "Creator Video",
      subtitle: "Turn one source image and prompt into a short AI creator video.",
      headline: "Generate your creator video.",
      pipeline: "Nano Banana Pro Edit → Kling Image-to-Video",
      credits: "40 Credits",
      addSourceImage: "Add Source Image",
      creativePrompt: "Creative Prompt",
      generate: "Generate Creator Video",
    },
    talking_creator: {
      eyebrow: "Talking Creator",
      title: "Talking Creator",
      subtitle:
        "Create a talking creator video from one image, a script and a selected voice.",
      headline: "Generate your talking creator clip.",
      pipeline: "Image-to-Video · ElevenLabs Voice · Lip Sync",
      credits: "60 Credits",
      addSourceImage: "Add Source Image",
      generate: "Generate Talking Creator",
    },
    motion_transfer: {
      eyebrow: "Motion Transfer",
      title: "Motion Transfer",
      subtitle: "Animate a creator image using a driving video.",
      addCharacter: "Add character",
      addMotion: "Add expression & motion",
      stepCharacter: "Step 1: Add character image",
      stepMotion: "Step 2: Add driving video",
      stepGenerate: "Step 3: Generate motion transfer",
      generateButton: "Generate Motion",
      comingSoonNote: "Coming soon — no credits charged in this preview.",
      modelTitle: "Model",
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
    title: "Create your next campaign visual.",
    subtitle:
      "Describe your idea, choose a visual mode and generate a ready-to-use asset for social media, ads, product campaigns or creator content.",
    enterHint: "Enter to generate · Shift+Enter for a new line",
    workspacePromptHeadline: "What do you want to create?",
    searchHeadline: "Create your next campaign visual.",
    imageStudioTab: "Image Studio",
    resultPlaceholderTitle: "Your result will appear here.",
    resultPlaceholderHint:
      "Generate a visual to preview it live. Completed assets are saved to your gallery automatically.",
    generateButton: "Generate Campaign Visual",
    processingTitle: "Creating your campaign visual…",
    processingStepBrief: "Analyzing campaign brief",
    processingStepDirection: "Applying visual direction",
    processingStepFormat: "Preparing social format",
    processingStepGenerating: "Generating final image",
    processingStepSaving: "Saving to Asset Gallery",
    promptTip:
      "Tip: Include the product, target audience, mood, platform and visual style for better results.",
    creditPreview:
      "This generation will use {cost} credits. You will have {remaining} credits left.",
    creditPreviewShort: "This generation will use {cost} credits.",
    resultReadyTitle: "Your campaign visual is ready.",
    resultReadyBody:
      "Download it, create a variation or use it as a reference for your next asset.",
    createVariant: "Create Variant",
    useAsReference: "Use as Reference",
    generateAnotherFormat: "Generate Another Format",
    saveFavorite: "Save to Favorites",
    openGallery: "Open in Gallery",
    imageModeChips: {
      standard: "Standard 1C",
      fastDraft: "Fast Draft 1C",
      ugcLook: "UGC Look 2C",
      premium: "Premium 3C",
      brandAssets: "Brand Assets 4C",
      referenceEdit: "Reference Edit 5C",
    },
    promptPlaceholder:
      "Example: Create a premium fitness creator campaign for Instagram featuring a confident athlete, luxury sportswear, cinematic gym lighting and a clean product-focused composition…",
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
    imageModeUGCLookActiveNote: "UGC Look · Beta · 2 Credits",
    imageModeFastDraftActiveNote: "Fast Draft · Beta · 1 Credit",
    imageModePremiumActiveNote: "Premium Image · Beta · 3 Credits",
    imageModeReferenceEditActiveNote: "Reference Edit · Beta · 5 Credits",
    imageModeBrandAssetsActiveNote: "Brand Assets · Beta · 4 Credits",
    imageModeVideoStudioActiveNote: "Video Studio · Beta · 25 Credits",
    imageModeCreatorVideoActiveNote: "Creator Video · Beta · 40 Credits",
    imageModeTalkingCreatorActiveNote: "Talking Creator · Beta · 60 Credits",
    studioTabImage: "Image Studio",
    studioTabVideo: "Video Studio",
    studioTabVideoPlanned: "Video Studio · Coming soon",
    studioTabCreatorVideo: "Creator Video",
    studioTabCreatorVideoPlanned: "Creator Video · Coming soon",
    studioTabTalkingCreator: "Talking Creator",
    studioTabTalkingCreatorPlanned: "Talking Creator · Coming soon",
    studioTabLipSync: "Lip Sync",
    studioTabLipSyncPlanned: "Lip Sync · Coming soon",
    creatorVideoMissingSource: "Source image required",
    creatorVideoMissingPrompt: "Prompt required",
    creatorVideoLongerHint:
      "Turn one image and a prompt into a short AI creator video.",
    generateCreatorVideo: "Generate Creator Video",
    talkingCreatorMissingSource: "Upload a source image for Talking Creator.",
    talkingCreatorMissingScript: "Script is required for Talking Creator.",
    talkingCreatorMissingVoice: "Choose a voice for Talking Creator.",
    talkingCreatorLongerHint:
      "Talking Creator may take longer than image generation.",
    generateTalkingCreator: "Generate Talking Creator",
    lipSyncMissingSource: "Please upload a source video.",
    lipSyncMissingAudio: "Please upload an audio file.",
    lipSyncMissingScript: "Please enter a script.",
    lipSyncMissingVoice: "Please select a voice.",
    lipSyncInvalidVoice: "Invalid voice selected.",
    lipSyncFailedRefunded: "Lip Sync failed. Your credits were refunded.",
    lipSyncUploadingFiles: "Uploading files…",
    lipSyncWaitForVideoUpload: "Please wait until the video upload is complete.",
    lipSyncWaitForAudioUpload: "Please wait until the audio upload is complete.",
    lipSyncSystemVoicesNotConfigured:
      "System voices are not configured yet. Upload audio instead.",
    lipSyncLongerHint:
      "Lip Sync may take longer than image generation.",
    generateLipSync: "Generate Lip Sync",
    lipSyncCreditsUpload: "30 credits with uploaded audio",
    lipSyncCreditsVoice: "35 credits with AI voice",
    imageModeLipSyncActiveNote: "Lip Sync Studio · Beta · 30-35 Credits",
    videoStudioMissingSource: "Upload a source image for Video Studio.",
    videoStudioMissingMotion: "Add a motion prompt for Video Studio.",
    videoStudioLongerHint:
      "Video generation may take longer than image generation.",
    generateVideo: "Generate Video",
    openVideo: "Open video",
    plannedExpansion: "Studio roadmap",
    imageModeActiveNote: "Standard Image · Live · 1 Credit",
    imageModeRoadmapLabel: "Also on the studio roadmap",
    imageModeRoadmapNote:
      "Preview only — not connected to generation or billing yet.",
    referenceEditMissingSource: "Upload a source image for Reference Edit.",
    referenceEditMissingInstruction:
      "Add edit instructions for Reference Edit.",
    studioRoadmapChips: [
      "Cinema Agent",
      "Omni Campaign Agent",
      "Social Planner",
      "Brand Safety / Compliance",
    ],
    futureModulesPlannedNote:
      "Planned modules — preview only. No API, credits, or provider calls.",
    imageModes: {
      standard: {
        label: "Standard",
        description: "Reliable campaign visual for everyday content.",
        creditLine: "Standard — 1 Credit",
      },
      ugcLook: {
        label: "UGC Look",
        description:
          "Authentic creator-style visual for social media and ads.",
        creditLine: "UGC Look — 2 Credits",
        hoverHint:
          "Best for casual creator posts, product recommendations and realistic social content.",
      },
      fastDraft: {
        label: "Fast Draft",
        description: "Quick concept test before producing polished assets.",
        creditLine: "Fast Draft — 1 Credit",
      },
      premium: {
        label: "Premium",
        description:
          "High-end campaign image with stronger styling, detail and polish.",
        creditLine: "Premium — 3 Credits",
      },
      referenceEdit: {
        label: "Reference Edit",
        description: "Use a reference image to guide the final result.",
        creditLine: "Reference Edit — 5 Credits",
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
          "Visuals aligned with a brand, product or campaign direction.",
        creditLine: "Brand Assets — 4 Credits",
        hoverHint:
          "Brand Assets supports ad creatives, product campaign layouts, thumbnails and social marketing visuals.",
      },
      lipSync: {
        label: "Lip Sync Studio",
        description:
          "Sync a creator video with your own audio or an AI-generated voice.",
        panel: {
          statusPlanned: "Coming soon · Planned",
          statusActive: "Beta",
          introPlanned:
            "Lip Sync Studio is coming soon. When enabled it costs 30 credits per job.",
          introActive:
            "Sync a creator video with your own audio or an AI-generated voice.",
          sourceLabel: "Source video",
          sourceVideoLabel: "Source video",
          sourceVideoPlaceholder: "Paste source video URL",
          sourceVideoHint:
            "You can use a video URL from Video Studio or the Asset Gallery.",
          sourcePlaceholder: "Upload source video",
          sourceHint: "Video: MP4/WebM/MOV · max 50 MB",
          uploadSource: "Upload source media",
          audioLabel: "Audio",
          audioPlaceholder: "Upload audio track",
          audioHint: "MP3, WAV, AAC, OGG, M4A, WebM · max 25 MB",
          uploadAudio: "Upload audio",
          uploading: "Uploading…",
          clearSource: "Clear source",
          clearAudio: "Clear audio",
          invalidSource: "Unsupported source file.",
          invalidAudio: "Unsupported audio file.",
          sourceTooLarge: "Source file is too large (max 50 MB).",
          audioTooLarge: "Audio file is too large (max 25 MB).",
          uploadFailed: "Upload failed. Please try again.",
          instructionsLabel: "Instructions (optional)",
          instructionsPlaceholder:
            "Describe expression, energy, or scene mood…",
          inputModeSystemVoice: "AI voice",
          inputModeUploadAudio: "Upload audio",
          voiceLibrary: "Voice Library",
          recommendedVoices: "Recommended voices",
          femaleVoices: "Female voices",
          maleVoices: "Male voices",
          categoryVoiceStyles: "Category voice styles",
          preview: "Preview",
          previewListen: "Listen",
          notConfiguredYet: "Not configured yet",
          previewNotAvailable: "Preview not available yet",
          scriptLabel: "Script for AI voice",
          scriptPlaceholder: "Write what the creator should say…",
          voiceLabel: "Voice",
          scriptRequired: "Script required",
          scriptCommandBarHint:
            "You can also edit the script in the command bar above.",
          selectedVoiceLabel: "Selected voice",
          sourceUploadedReady: "Video uploaded — ready to generate.",
          systemVoicesNotConfigured: "System voices are not configured yet.",
          uploadAudioInstead: "Upload audio instead.",
          usePreviousVideo: "Use previous video",
          activeNote:
            "Upload audio (30 credits) or AI voice + script (35 credits).",
        },
      },
      videoStudio: {
        label: "Video Studio",
        description:
          "Animate a source image into a short cinematic social video.",
        panel: {
          statusPlanned: "Coming soon · Planned",
          statusActive: "Beta",
          introPlanned:
            "Video Studio is being prepared for image-to-video generation.",
          introActive:
            "Upload a source image and describe the motion. Your video appears in the agent and gallery.",
          sourceLabel: "Source image",
          sourcePlaceholder: "Upload a source image to animate",
          sourceHint: "PNG, JPEG, or WebP · max 12 MB",
          uploadSourceImage: "Upload source image",
          uploading: "Uploading…",
          clearImage: "Clear image",
          invalidFile: "Please choose a JPEG, PNG, or WebP image.",
          fileTooLarge: "Image is too large (max 12 MB).",
          uploadFailed: "Upload failed. Please try again.",
          motionLabel: "Motion prompt",
          motionPlaceholder:
            "Describe camera motion, mood, and scene energy…",
          motionHint: "Required — describe how the image should move.",
          activeNote:
            "Video Studio animates your source image into a 5-second campaign clip.",
        },
      },
      creatorVideo: {
        label: "Creator Video",
        description:
          "Turn a source image and prompt into a short AI creator video.",
        panel: {
          statusPlanned: "Coming soon · Planned",
          statusActive: "Beta",
          introPlanned:
            "Creator Video is being prepared for Nano Banana and Kling pipeline generation.",
          introActive:
            "Upload one source image, add your creative prompt, and generate a short AI creator video.",
          sourceLabel: "Source image",
          sourcePlaceholder: "Upload source image",
          sourceHint: "PNG, JPEG, or WebP · max 12 MB",
          uploadSourceImage: "Upload source image",
          uploading: "Uploading…",
          clearImage: "Clear image",
          invalidFile: "Please choose a JPEG, PNG, or WebP image.",
          fileTooLarge: "Image is too large (max 12 MB).",
          uploadFailed: "Upload failed. Please try again.",
          creativePromptLabel: "Creative Prompt",
          creativePromptPlaceholder:
            "Create a realistic AI creator video style portrait, natural face, premium fashion look, subtle motion, social media creator aesthetic…",
          creativePromptHint: "Required — describe the creator video style and mood.",
          activeNote:
            "Turn one image and a prompt into a short AI creator video. Cost: 40 Credits.",
        },
      },
      talkingCreator: {
        label: "Talking Creator",
        description:
          "One-click mode: image + script + voice to a talking creator video.",
        panel: {
          statusPlanned: "Coming soon · Planned",
          statusActive: "Beta",
          introPlanned:
            "Talking Creator is being prepared for one-click talking videos.",
          introActive:
            "Upload one source image, add your script, choose a voice, and generate a talking creator clip.",
          sourceLabel: "Source image",
          sourcePlaceholder: "Upload source image",
          sourceHint: "PNG, JPEG, or WebP · max 12 MB",
          uploadSourceImage: "Upload source image",
          uploading: "Uploading…",
          clearImage: "Clear image",
          invalidFile: "Please choose a JPEG, PNG, or WebP image.",
          fileTooLarge: "Image is too large (max 12 MB).",
          uploadFailed: "Upload failed. Please try again.",
          scriptLabel: "Script",
          scriptPlaceholder: "Enter the spoken text for your creator video…",
          voiceLabel: "Voice",
          voiceLibrary: "Voice Library",
          recommendedVoices: "Recommended voices",
          femaleVoices: "Female voices",
          maleVoices: "Male voices",
          categoryVoiceStyles: "Category voice styles",
          preview: "Preview",
          previewListen: "Listen",
          notConfiguredYet: "Not configured yet",
          previewNotAvailable: "Preview not available yet.",
          activeNote:
            "This creates a talking creator video from one image. Cost: 60 Credits.",
        },
      },
      live: "Live",
      beta: "Beta",
      oneCredit: "1 Credit",
      twoCredits: "2 Credits",
      threeCredits: "3 Credits",
      fourCredits: "4 Credits",
      fiveCredits: "5 Credits",
      twentyFiveCredits: "25 Credits",
      thirtyCredits: "30 Credits",
      fortyCredits: "40 Credits",
      sixtyCredits: "60 Credits",
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
    generatingVideo: "Generating your video…",
    generatingCreatorVideo: "Generating your creator video…",
    generatingTalkingCreator: "Generating your talking creator video…",
    generatingLipSync: "Generating your lip sync video…",
    completed: "Generation completed",
    failed: "Generation failed",
    openImage: "Open image",
    viewInGallery: "View in Gallery",
    createAnother: "Create another",
    suggestedCaptionTitle: "Suggested Caption",
    suggestedCaptionSubtitle: "Caption for your post",
    suggestedCaptionCopy: "Copy Caption",
    suggestedCaptionCopied: "Copied",
    socialPlannerTitle: "Social Planner",
    socialPlannerSubtitle: "Plan this asset (no auto posting)",
    socialPlannerDateLabel: "Date",
    socialPlannerTimeLabel: "Time",
    socialPlannerAdd: "Add to plan",
    socialPlannerCopyCaption: "Copy caption",
    socialPlannerCopyPlan: "Copy plan",
    socialPlannerAdded: "Added to plan",
    complianceTitle: "Compliance checklist",
    complianceSubtitle: "Quick pre-publish review checklist",
    complianceItemNoFakeText: "No unwanted / fake text",
    complianceItemNoFakeLogo: "No fake logos / brands",
    complianceItemNoArtifacts: "No obvious AI artifacts",
    complianceItemDisclosure: "AI disclosure reminder (if needed)",
    complianceMarkReviewed: "Mark as reviewed",
    complianceReviewed: "Reviewed",
    cinemaAgentTitle: "Cinema Agent (planning)",
    cinemaAgentSubtitle: "Create a 5-shot campaign plan.",
    omniAgentTitle: "Omni Campaign Agent (planning)",
    omniAgentSubtitle: "Create a 7-day campaign rollout plan.",
    copyPlan: "Copy plan",
    planCopied: "Plan copied",
    processingHint:
      "We’re applying your selected mode, style profile and format to generate a ready-to-use asset.",
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
    generationAlreadyProcessing:
      "A generation is already processing. Please wait until it finishes.",
    activeGenerationLimitTitle: "You already have active generations running.",
    activeGenerationLimitIntro:
      "Please wait until one finishes before starting another.",
    creditsRefundedHint: "Credits were refunded.",
    promptLoadedRegeneration: "Prompt loaded for regeneration.",
    campaignPromptLoaded: "Campaign prompt loaded into AI Agent.",
  },
  gallery: {
    loading: "Loading your Asset Gallery…",
    empty: "No assets match your filters yet.",
    emptyTitle: "No assets yet",
    emptyBody:
      "Create your first campaign visual in the AI Agent and it will appear here automatically.",
    emptyCta: "Create first visual",
    searchEmptyTitle: "No matching assets found",
    searchEmptyBody:
      "Try another keyword, status filter or style profile.",
    searchPlaceholder: "Search prompts or ideas…",
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
    lipSyncBadge: "Lip Sync",
    creatorVideoBadge: "Creator Video",
    talkingCreatorBadge: "Talking Creator",
    videoBadge: "Video",
    ugcLookBadge: "UGC Look",
    videoUnavailable: "Video unavailable",
    noVideoUrl: "This generation has no video URL.",
    openVideoDirectly: "Open video directly",
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
      "Your generation is running. The gallery refreshes automatically.",
  },
  styleProfiles: {
    loading: "Loading style profiles...",
    brandDirection: "Brand & creator direction",
    disclaimer:
      "Style profiles store reusable creative direction (look, mood, styling). They are not fixed identity models.",
    newProfile: "New style profile",
    buildDirection: "New style profile",
    buildDescription:
      "Create reusable creative direction for campaign visuals — look, mood and styling in one profile.",
    profileName: "Profile name",
    profileNamePlaceholder: "e.g. Premium Fitness Creator",
    creativeTag: "Creative tag (optional)",
    creativeTagPlaceholder: "e.g. Fitness · UGC · Product · Luxury",
    profileSummary: "Profile summary",
    profileSummaryPlaceholder:
      "Describe what this profile should be used for, such as campaign type, audience, brand mood or creator style.",
    guidanceTitle: "How Style Profiles work",
    guidanceBody:
      "Style Profiles guide the visual direction of your generations — including mood, styling, framing and brand look. They help keep your output consistent without creating fixed identity models.",
    creativeDirection: "Creative direction",
    appearanceDirection: "Appearance direction",
    appearancePlaceholder:
      "Describe appearance, wardrobe, framing, lighting, poses and recurring visual details.",
    moodDirection: "Mood direction",
    moodPlaceholder:
      "Describe the emotional tone: premium, energetic, natural, cinematic, clean, bold, elegant or authentic.",
    brandDirectionLabel: "Brand direction",
    brandPlaceholder:
      "Add brand colors, product focus, visual rules, do's and don'ts for consistent output.",
    negativeDirectionLabel: "Negative direction",
    negativePlaceholder:
      "Describe what should be avoided, such as unrealistic skin, distorted hands, wrong logos, cheap lighting or off-brand colors.",
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
      "Choose the right credit package for your creative workflow and generate campaign visuals with transparent usage. Standard images start at 1 credit.",
    modeUsageIntro: "Credits are used depending on the selected mode.",
    workflowChargeNote:
      "Credits are charged based on the selected workflow.",
    modeCosts: {
      standard: "Standard Image: 1 Credit",
      ugcLook: "UGC Look: 2 Credits",
      fastDraft: "Fast Draft: 1 Credit",
      premium: "Premium Image: 3 Credits",
      referenceEdit: "Reference Edit: 5 Credits",
      brandAssets: "Brand Assets: 4 Credits",
      videoStudio: "Video Studio: 25 Credits",
      creatorVideo: "Creator Video: 40 Credits",
      lipSync: "Lip Sync Studio: 30-35 Credits",
      talkingCreator: "Talking Creator: 60 Credits",
    },
    lipSyncUsageNote:
      "Lip Sync uses source video + uploaded audio (30) or System Voice (35).",
    oneCreditRule: "1 standard image = 1 credit",
    availableCredits: "Available credits",
    refreshing: "Refreshing balance…",
    refreshBalance: "Refresh balance",
    buyCreditsCta: "Buy Credits",
    upgradeCreditsCta: "Upgrade Credits",
    creditPackages: "Credit packages",
    choosePlan: "Choose a plan for your workflow",
    secureCheckout: "Secure checkout via Stripe",
    modeCostsLabel: "Mode costs",
    price: "Price",
    creditsIncluded: "Credits included",
    creditsUnit: "Credits",
    standardImages: "≈ {count} standard images (1 image = 1 credit)",
    redirecting: "Redirecting to checkout…",
    customTopUpTitle: "Custom Credit Top-Up",
    customTopUpIntro:
      "Need a flexible amount? Add custom credits starting from 100 credits.",
    customTopUpPricePerCredit: "Custom credits cost €0.10 per credit.",
    customTopUpExamples:
      "Examples: 100 credits = €10, 250 credits = €25, 1000 credits = €100.",
    customTopUpPackageHint: "Larger packages offer better value.",
    customTopUpLabel: "Custom credits",
    customTopUpPlaceholder: "100",
    customTopUpBuy: "Buy Custom Credits",
    customTopUpMinError: "Minimum top-up is 100 credits.",
    customTopUpMaxError: "Maximum top-up is 10000 credits.",
    footerNote:
      "Credits are added to your account after successful payment. Unused credits remain on your balance until used in the AI Agent.",
    recommended: "Recommended",
    mostPopular: "Most Popular",
    trustNotes: [
      "Secure checkout via Stripe",
      "Transparent credit usage",
      "Credits shown before each generation",
      "Assets saved in your gallery",
      "Download your generated visuals",
    ],
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
        tagline: "For Testing",
        description:
          "Explore InfluExAi, test prompts and create your first campaign visuals before scaling production.",
        benefits: [
          "100 credits included",
          "AI Agent image generation",
          "Social media format presets",
          "Asset Gallery storage",
          "Great for first tests and early ideas",
        ],
        button: "Start with Starter",
      },
      professional: {
        tagline: "Recommended for Regular Creators",
        description:
          "The best choice for consistent content production, reusable Style Profiles and regular campaign visuals.",
        benefits: [
          "Everything in Starter",
          "Style Profiles for reusable creative direction",
          "Built for weekly creator workflows",
          "Best value for ongoing production",
        ],
        button: "Choose Professional",
      },
      ultimate: {
        tagline: "For Teams & High-Volume Workflows",
        description:
          "Scale campaign production with a large credit reserve for businesses, agencies and power users.",
        benefits: [
          "Everything in Professional",
          "High-volume generation",
          "Suitable for teams and agencies",
          "Ideal for testing multiple creative directions",
        ],
        button: "Scale with Ultimate",
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
      "Kampagnen-Orchestrierung und Compliance — in einem zukünftigen Release.",
    toolRailStatuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Bald",
      planned: "Geplant",
    },
    toolRail: {
      sectionTitle: "Studio-Tools",
      plannedSectionTitle: "Geplant",
      imageStudio: "Image Studio",
      imageStudioTip: "Kampagnenfertige Bilder für Social, Ads und Produkte",
      videoStudio: "Video Studio",
      videoStudioTip: "Statische Visuals in kurze Kampagnenvideos verwandeln",
      lipSync: "Lip Sync",
      lipSyncTip: "Talking-Head-Videos mit Stimme und Quellvideo",
      creatorVideo: "Creator Video",
      creatorVideoTip: "Ein Bild und Prompt als kurzes AI-Creator-Video",
      talkingCreator: "Talking Creator",
      talkingCreatorTip: "Sprechender Clip aus Bild, Skript und Stimme",
      motionTransfer: "Motion Transfer",
      motionTransferTip: "Creator-Bild mit Driving-Video animieren",
      brandAssets: "Brand Assets",
      brandAssetsTip: "Markenkonforme Kampagnenvisuals und Produktlayouts",
      referenceEdit: "Reference Edit",
      referenceEditTip: "Ergebnis mit Referenzbild steuern",
      cinemaAgent: "Cinema Agent",
      cinemaAgentTip: "Szenen und Shot Lists vor der Generierung planen",
      omniAgent: "Omni Campaign Agent",
      omniAgentTip: "Ein Brief für Visuals, Video-Konzepte und Captions",
      socialPlanner: "Social Planner",
      socialPlannerTip: "Captions, Hashtags und Posting-Kalender planen",
      compliance: "Compliance",
      complianceTip: "Claims, Logos und Brand Safety prüfen",
      watermark: "Watermark",
      watermarkTip: "Wasserzeichen-Previews zum Konzepttest",
    },
    expansionFootnote:
      "Geplante Module bleiben bis zu einem späteren Release deaktiviert.",
    roadmap: "Roadmap",
    roadmapBody:
      "Bildmodi wählst du im AI Agent. Video, Lip Sync und Campaign Agents folgen in späteren Expansion-Releases.",
    watermarkedPromoTitle: "Watermarked Promo-Paket",
    watermarkedPromoBadge: "Geplant",
    watermarkedPromoBody:
      "Günstige Exporte mit sichtbarem InfluExAi-Wasserzeichen zum Testen und für Brand Discovery — geplantes Monetarisierungsmodul, noch nicht live. Später Upgrade für Export ohne Wasserzeichen.",
    home: "Startseite",
    logout: "Abmelden",
    studioMenu: "Studio-Menü",
    live: "Live",
    beta: "Beta",
    comingSoon: "Demnächst",
    planned: "Geplant",
    roadmapBadge: "Roadmap",
    moduleUnavailable: "In der aktuellen Version nicht verfügbar.",
    creativeModes: "Creative Modes",
    creativeModesHint:
      "Bild-, Video- und Lip-Sync-Workflows laufen im AI Agent. Credits je gewähltem Modus.",
    expansionPlanned: "Expansion / Geplant",
    expansionPlannedHint:
      "Bildmodi laufen im AI Agent. Öffne Werkzeuge für die vollständige Studio-Roadmap.",
    creditCostShort: "Credits",
    nav: {
      home: { label: "Home", description: "Dashboard-Übersicht" },
      agent: {
        label: "AI Agent",
        description: "Kampagnenvisuals erstellen",
      },
      tools: {
        label: "Tools",
        description: "Workflows entdecken",
      },
      gallery: {
        label: "Asset Gallery",
        description: "Assets verwalten",
      },
      characters: {
        label: "Style Profiles",
        description: "Styles speichern",
      },
      credits: { label: "Credits", description: "Guthaben und Pakete" },
      planner: {
        label: "Campaign Planner",
        description:
          "Plane Kampagnenkonzepte, Shot Lists, Captions, Schedules und Safety Checks vor der Asset-Generierung.",
      },
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
        activeNote:
          "Aktiv: Campaign Planner im Live Studio (Planning Beta)",
      },
      omniCampaignAgent: {
        label: "Omni Campaign Agent",
        description:
          "Wandle eine Kampagnen-Idee in Visuals, Video-Konzepte, Captions und exportfertige Assets um.",
      },
      socialPlanner: {
        label: "Social Planner",
        description:
          "Plane Posts und Kampagnen-Kalender — nur Vorschau, keine Social-Posting-API.",
      },
      brandSafety: {
        label: "Brand Safety / Compliance",
        description:
          "Policy-Checks und Compliance-Hinweise für Kampagnen-Assets.",
      },
    },
  },
  dashboardNav: {
    dashboard: { label: "Dashboard", sublabel: "Übersicht" },
    createStudio: {
      label: "AI Create Studio",
      sublabel: "Assets erstellen",
      workspaceTitle: "AI Create Studio",
      workspaceSubline:
        "Wähle einen Modus — Bild, Video oder Lip Sync — und generiere in einem fokussierten Workspace.",
      tabImage: "Bild",
      tabVideo: "Video",
      tabLipSync: "Lip Sync",
    },
    gallery: { label: "Asset Gallery", sublabel: "Assets verwalten" },
    styleProfiles: { label: "Style Profiles", sublabel: "Wiederverwendbare Styles" },
    credits: { label: "Credits / Billing", sublabel: "Pakete und Guthaben" },
    upcoming: { label: "Demnächst", sublabel: "Zukünftige Tools" },
    topBar: {
      welcome: "Willkommen zurück, Georgios! 👋",
      subline: "Bereit für dein nächstes Kampagnen-Asset?",
      searchPlaceholder: "Assets, Vorlagen oder Workflows suchen…",
      creditsAvailable: "{count} Credits verfügbar",
      addCredits: "Credits aufladen",
    },
  },
  studioSuite: {
    title: "Studio-Modi",
    description:
      "Wähle den passenden Workflow für dein Kampagnen-Asset. Credits werden je gewähltem Modus verbraucht.",
    workflowChargeNote:
      "Credits werden je gewähltem Workflow verbraucht.",
    creditCost: "Credit-Kosten",
    bestFor: "Ideal für",
    status: "Status",
    tool: "Tool",
    modes: {
      standard: {
        label: "Standard Image",
        credits: "1 Credit",
        bestFor: "Zuverlässige Kampagnenvisuals",
      },
      ugcLook: {
        label: "UGC Look",
        credits: "2 Credits",
        bestFor: "Organischer Social Content",
      },
      fastDraft: {
        label: "Fast Draft",
        credits: "1 Credit",
        bestFor: "Schnelle visuelle Exploration",
      },
      premium: {
        label: "Premium Image",
        credits: "3 Credits",
        bestFor: "Höherwertige Kampagnenvisuals",
      },
      referenceEdit: {
        label: "Reference Edit",
        credits: "5 Credits",
        bestFor: "Geführte Bildbearbeitung",
      },
      brandAssets: {
        label: "Brand Assets",
        credits: "4 Credits",
        bestFor: "Ad Creatives und Produktvisuals",
      },
      videoStudio: {
        label: "Video Studio",
        credits: "25 Credits",
        bestFor: "Image-to-Video Creator-Clips",
      },
      lipSync: {
        label: "Lip Sync Studio",
        credits: "30 Credits",
        bestFor: "Talking-Creator-Clips",
      },
    },
    planned: {
      cinemaAgent: {
        label: "Cinema Agent",
        bestFor: "Shot-Planung und Szenen-Briefings",
      },
      omniCampaignAgent: {
        label: "Omni Campaign Agent",
        bestFor: "Kanalübergreifende Kampagnen-Orchestrierung",
      },
      socialPlanner: {
        label: "Social Planner",
        bestFor: "Content-Kalender und Post-Planung",
      },
      brandSafety: {
        label: "Brand Safety / Compliance",
        bestFor: "Policy- und Compliance-Prüfung",
      },
      watermarkedPromo: {
        label: "Watermarked Promo Package",
        bestFor: "Günstige Exporte mit Wasserzeichen",
      },
    },
  },
  campaignPlanner: {
    title: "Campaign Planner",
    subtitle: "Cinema Agent · Planning Beta",
    intro:
      "Plane Kampagnenkonzepte, Shot Lists, Captions, Schedules und Safety Checks vor der Asset-Generierung. Diese Vorschau läuft vollständig im Browser — keine Credits, keine Provider-Calls.",
    badges: {
      planningBeta: "Planning Beta",
      noCredits: "Keine Credits",
      manualRequired: "Nur manuelle Generierung",
      batchPlanned: "Batch-Generierung geplant",
      planned: "Geplant",
    },
    estimate: {
      title: "Campaign Estimate",
      intro:
        "Nur Vorschau — es werden keine Credits abgezogen. Nutze einzelne Prompts im AI Agent, bis Batch-Generierung verfügbar ist.",
      estimatedCredits: "Geschätzte Credits",
      totalEstimated: "Geschätzte Credits gesamt",
      futureEstimate: "Zukünftige Schätzung",
      batchNote:
        "Batch-Generierung ist geplant. Aktuell kannst du ausgewählte Prompts manuell im AI Agent generieren.",
      lineItems: {
        stories: "Story-Bilder",
        feedPosts: "Feed-Post-Bilder",
        reel: "Reel / Short-Video",
        shots: "Shot-Card-Bilder",
      },
      counts: {
        storyIdeas: "Story-Ideen",
        feedPosts: "Feed-Post-Ideen",
        reelShort: "Reel / Short-Ideen",
        shotCards: "Shot Cards",
      },
      creditsPerUnit: "{count} × {credits} Credit",
      creditsPerUnitPlural: "{count} × {credits} Credits",
    },
    socialPlanner: {
      title: "Social Planner Preview",
      intro:
        "Vorgeschlagene Posting-Reihenfolge für manuelles Publishing. Keine Plattform-Anbindung, kein automatisches Scheduling.",
      suggestedPostingOrder: "Vorgeschlagene Posting-Reihenfolge",
      suggestedDays: "Tag",
      timeWindow: "Zeitfenster",
      captionsLabel: "Captions",
      hashtagsLabel: "Hashtags",
      platformFit: "Plattform-Fit",
      manualPosting: "Manuelles Posting",
      noSocialApi: "Keine Social-API verbunden",
      copySchedule: "Schedule kopieren",
      copyCaptions: "Captions kopieren",
      scheduleAutomatically: "Automatisch planen",
      scheduleAutoHint:
        "Automatisches Scheduling erfordert Plattform-API-Prüfung und ausdrückliche Nutzer-Freigabe.",
      platforms: {
        instagramFeed: "Instagram Feed",
        instagramStory: "Instagram Story",
        tiktokReels: "TikTok / Reels",
        youtubeShorts: "YouTube Shorts",
      },
      slots: {
        launchVisual: "Launch-Visual",
        behindTheScenes: "Behind-the-scenes Angle",
        shortHook: "Short-Hook-Video-Idee",
        engagementStory: "Engagement-Story-Beat",
        recapClip: "Recap-Clip",
      },
      platformFitNotes: {
        instagramFeed: "Hero-Stills, Produktfokus, Launch-Posts",
        instagramStory: "BTS, Polls, schnelle Proof Points",
        tiktokReels: "Vertikale Motion, Hook-first Short Clips",
        youtubeShorts: "Recap, Teaser, CTA-freundlicher Vertical Cut",
      },
      dayLine: "Tag {day} — {platform} — {content} — {time}",
    },
    brandSafety: {
      title: "Brand Safety Preview",
      intro:
        "Dies ist eine manuelle Pre-Publish-Checkliste. Automatisiertes Compliance-Scanning ist geplant.",
      checklistTitle: "Pre-Publish Brand-Safety-Checkliste",
      copyChecklist: "Checkliste kopieren",
      runAutomatedScan: "Automatischen Scan ausführen",
      runScanHint:
        "Automatisiertes Scanning erfordert Computer-Vision-Validierung und rechtliche Prüfung vor der Aktivierung.",
      badges: {
        manualChecklist: "Manuelle Checkliste",
        noAutomatedScan: "Kein automatischer Scan",
        compliancePlanned: "Compliance geplant",
      },
      items: {
        aiDisclosure: {
          label: "AI-Content-Disclosure / Hinweis",
          description:
            "Füge dort, wo es Brand-Guidelines oder Recht verlangen, einen kurzen Hinweis auf AI- oder Synthetic-Media-Inhalte hinzu.",
        },
        readableText: {
          label: "Auf ungewollt lesbaren Text prüfen",
          description:
            "Scanne Visuals nach zufälligen lesbaren Wörtern, UI-Fragmenten oder Artefakten, die verwirrend oder off-brand wirken könnten.",
        },
        fakeLogos: {
          label: "Auf Fake-Logos oder Markennamen prüfen",
          description:
            "Stelle sicher, dass keine unbeabsichtigten Logos, Marken oder Markennamen Dritter enthalten sind, an denen du keine Rechte hast.",
        },
        handsFaces: {
          label: "Hände, Finger und Gesichter prüfen",
          description:
            "Überprüfe Hände, Finger, Gesichter und Mimik auf Realismus und mögliche Artefakte, bevor du veröffentlichst.",
        },
        productClaims: {
          label: "Produktversprechen und Rechtstexte prüfen",
          description:
            "Stimme Claims, Angebote und Garantien in Captions und Overlays mit Fakten und ggf. Legal-Team ab.",
        },
        usageRights: {
          label: "Nutzungsrechte für Assets bestätigen",
          description:
            "Bestätige, dass du die Rechte zur Nutzung aller hochgeladenen, referenzierten und Stock-Assets in der Kampagne besitzt.",
        },
        platformCompliance: {
          label: "Plattform-Compliance vor Posting prüfen",
          description:
            "Gleiche die Kampagne mit Plattform-Richtlinien, sensiblen Inhalten und Altersbeschränkungen ab.",
        },
        watermarkDisclosure: {
          label: "Watermark / Disclosure-Hinweis falls nötig",
          description:
            "Füge bei Bedarf ein Wasserzeichen oder einen Disclosure-Hinweis hinzu, wenn Brand, Plattform oder Recht dies für AI-Content verlangen.",
        },
      },
    },
    exportPackage: {
      title: "Export Package Preview",
      intro:
        "Export-Pakete sind geplant. Aktuell kannst du den Kampagnenplan manuell kopieren.",
      packageContents: "Paketinhalt",
      copyFullPlan: "Vollen Kampagnenplan kopieren",
      copyShotPrompts: "Shot Prompts kopieren",
      copyCaptions: "Captions kopieren",
      exportPdfZip: "Als PDF / ZIP exportieren",
      exportPdfZipHint:
        "PDF- und ZIP-Export sind geplant. Zukünftige Pakete enthalten Briefing, Prompts, Captions, Schedule und Safety-Checkliste.",
      fullPlanHeader: "InfluExAi — Kampagnenplan Export",
      campaignBriefSection: "Kampagnen-Briefing",
      socialScheduleSection: "Social Schedule",
      socialScheduleUnavailable: "Social Schedule nicht verfügbar.",
      brandSafetySection: "Brand-Safety-Checkliste",
      shotLabel: "Shot",
      captionLabel: "Caption",
      badges: {
        manualExport: "Manueller Export",
        pdfZipPlanned: "PDF/ZIP geplant",
      },
      contents: {
        campaignBrief: "Kampagnen-Briefing",
        shotPrompts: "Shot Prompts",
        captions: "Captions",
        hashtags: "Hashtags",
        socialSchedule: "Social Schedule",
        brandSafetyChecklist: "Brand-Safety-Checkliste",
      },
    },
    fields: {
      campaignIdea: "Kampagnenidee",
      productBrand: "Produkt / Marke",
      platformFocus: "Plattform-Fokus",
      goal: "Ziel",
    },
    placeholders: {
      campaignIdea:
        "Beschreibe die Kampagne: Zielgruppe, Angebot, Stimmung und Kernbotschaft…",
      productBrand: "Marken- oder Produktname",
    },
    platforms: {
      instagram: "Instagram",
      tiktok: "TikTok / Reels",
      youtube: "YouTube",
      linkedin: "LinkedIn",
      multi: "Multi-Plattform",
    },
    goals: {
      awareness: "Markenbekanntheit",
      engagement: "Engagement",
      conversion: "Conversion",
      launch: "Produktlaunch",
    },
    formats: {
      instagram: "4:5 Feed / 9:16 Story",
      tiktok: "9:16 Vertikal",
      youtube: "16:9 Thumbnail / Shorts",
      linkedin: "1:1 oder 4:5 Professional",
      multi: "Quadrat + Vertikal Mix",
    },
    generatePlan: "Kampagnenplan generieren",
    planningPreviewNote: "Planning Beta · keine Credits · nur clientseitig",
    sections: {
      campaignAngle: "Campaign Angle",
      contentSet: "Content Set",
      shotList: "Shot List",
      captions: "Captions",
      hashtags: "Hashtag-Ideen",
      nextSteps: "Nächste Schritte",
    },
    contentSet: {
      stories: "3 Story-Ideen",
      feedPosts: "2 Feed-Post-Ideen",
      reel: "1 Reel / Short-Video-Idee",
    },
    shotCard: {
      imagePrompt: "Vorgeschlagener Bild-Prompt",
      videoMotion: "Vorgeschlagene Video-Bewegung",
    },
    actions: {
      copyPrompt: "Prompt kopieren",
      copyCaption: "Caption kopieren",
      copyHashtags: "Hashtags kopieren",
      copied: "Kopiert",
      useInAgent: "Im AI Agent nutzen",
      generateFullCampaign: "Volle Kampagne generieren",
      generateFullCampaignHint:
        "Batch-Generierung ist geplant. Aktuell kannst du ausgewählte Prompts manuell im AI Agent generieren.",
    },
    nextSteps: [
      "Kopiere Bild-Prompts in den AI Agent für Standard oder Premium Image.",
      "Nutze Video Studio Motion-Prompts für Short-Form-Clips.",
      "Verfeinere Captions vor dem Publishing — kein Auto-Posting in dieser Vorschau.",
    ],
    defaults: {
      brandFallback: "deine Marke",
      ideaFallback: "dein Kampagnenkonzept",
    },
    hashtagSeeds: [
      "#{brand}",
      "#CreatorMarketing",
      "#BrandCampaign",
      "#SocialAds",
      "#ContentStrategy",
      "#VisualStorytelling",
      "#DigitalMarketing",
      "#InfluencerStyle",
    ],
    templates: {
      angleAwareness:
        "Positioniere {brand} für Top-of-Funnel-Awareness auf {platform}: führe mit der Idee \"{idea}\" und einer premium, scroll-stoppenden Visual Identity im Einklang mit {goal}.",
      angleEngagement:
        "Fördere Gespräche um {brand} auf {platform}, indem du \"{idea}\" als relatable Creator-Moment framst — optimiert für Saves, Shares und Kommentare ({goal}).",
      angleConversion:
        "Wandle Aufmerksamkeit für {brand} auf {platform} in Handlungen: kombiniere \"{idea}\" mit klarem Produktnachweis, Social Proof und einem fokussierten CTA ({goal}).",
      angleLaunch:
        "Launch-Narrativ für {brand}: führe \"{idea}\" mit cinematic Reveal-Energie auf {platform} ein und baue Spannung Richtung {goal} auf.",
      story1:
        "Behind-the-scenes: wie {brand} den Drop zu \"{idea}\" vorbereitet — authentisch, handheld Story-Framing.",
      story2:
        "Schnelle Poll- oder Frage-Sticker: Meinung der Audience zum {goal}-Winkel von \"{idea}\".",
      story3:
        "Social-Proof-Slide: Kunden- oder Creator-Reaktion, warum \"{idea}\" für {brand} wichtig ist.",
      feed1:
        "Hero-Still für {brand}: premium Commercial Lighting, Produkt- oder Creator-Fokus für \"{idea}\".",
      feed2:
        "Lifestyle-Kontext: {brand} in realer Nutzung, editorial Color Grade, kampagnenfertige Komposition.",
      reelIdea:
        "15–30s vertikaler Beat: Detail-Macro, Full-Scene-Reveal, Abschluss mit Logo oder Offer — Motion unterstützt \"{idea}\" für {platform}.",
      shot1Title: "Hero Opening",
      shot2Title: "Produktfokus",
      shot3Title: "Creator Moment",
      shot4Title: "Environment Wide",
      shot5Title: "Closing CTA Frame",
      shot1Direction:
        "Cinematic Opener — selbstbewusstes Subject, premium Key Light, geringe Schärfentiefe.",
      shot2Direction:
        "Enger Produkt- oder Offer-Frame — cleaner Hintergrund, brand-forward Styling.",
      shot3Direction:
        "Creator-Portrait-Energie — authentischer Ausdruck, on-brand Wardrobe.",
      shot4Direction:
        "Weiter Lifestyle-Kontext — Umgebung stützt die Kampagnen-Narrative.",
      shot5Direction:
        "Abschlussframe mit Platz für Headline oder CTA-Overlay — balancierter Negativraum.",
      shot1ImagePrompt:
        "Premium Kampagnenvisual für {brand}, Konzept: {idea}, cinematic Commercial Lighting, high-end Social-Ad-Ästhetik, scharfer Fokus, kein Text, kein Logo.",
      shot2ImagePrompt:
        "Produktfokussierter Kampagnen-Shot für {brand}, {idea}, Studio-Softbox-Licht, cleane Komposition, Luxury-Advertising-Stil, kein Text.",
      shot3ImagePrompt:
        "Creator-Portrait für {brand}-Kampagne, {idea}, editorial Fashion Lighting, selbstbewusste Stimmung, realistische Hauttextur, kein Text.",
      shot4ImagePrompt:
        "Weite Lifestyle-Szene für {brand}, {idea}, natürliche Umgebung, Golden-Hour- oder Studio-Mix-Licht, Kampagnenfotografie, kein Text.",
      shot5ImagePrompt:
        "Abschluss-Kampagnenframe für {brand}, {idea}, balancierte Komposition mit Negativraum für Copy, premium Commercial Finish, kein Text.",
      shot1VideoPrompt:
        "Langsamer Push-in, subtiles Parallax, premium Kampagnen-Energie.",
      shot2VideoPrompt:
        "Sanfte Orbit um Produkt, Licht-Sweep über Oberfläche.",
      shot3VideoPrompt:
        "Subtile Kopfdrehung, weiche Haarbewegung, editorial Portrait Motion.",
      shot4VideoPrompt:
        "Langsamer Pan über Szene, atmosphärische Tiefe, cinematic Pacing.",
      shot5VideoPrompt:
        "Fade-in Logo-Bereich, minimale Kamerabewegung, selbstbewusster End-Beat.",
      caption1:
        "{brand}: {idea} — gemacht für {platform}. Entdecke die Story hinter der Kampagne.",
      caption2:
        "Neu von {brand}. {idea} — crafted für {goal}. Sieh das volle Visual Set im Feed.",
      caption3:
        "Dein nächster Scroll-Stopper von {brand}. {idea} — premium Visuals, bereit für {platform}.",
    },
  },
  page: {
    checkoutSuccess:
      "Zahlung erfolgreich. Deine Credits wurden deinem Guthaben gutgeschrieben.",
    checkoutCancelled:
      "Checkout abgebrochen. Es wurde nichts berechnet.",
    generationQueued: "Generierung erfolgreich in die Warteschlange gestellt.",
    promptLoaded: "Prompt wurde in den AI Agent geladen.",
    campaignPromptLoaded: "Kampagnen-Prompt in den AI Agent geladen.",
    styleProfilesUpdated: "Style Profiles aktualisiert.",
    gallery: {
      eyebrow: "Creator Assets",
      title: "Asset Gallery",
      description:
        "Ergebnisse prüfen, Processing verfolgen, Favoriten speichern, Prompts regenerieren und Kampagnen-Assets herunterladen.",
    },
    characters: {
      eyebrow: "Wiederverwendbare Creative Direction",
      title: "Style Profiles",
      description:
        "Erstelle wiederverwendbare Profile für Look, Mood und Styling – für konsistentere Ergebnisse.",
    },
    credits: {
      eyebrow: "Abrechnung",
      title: "Credits & Pläne",
      description:
        "Guthaben anzeigen, Modus-Kosten verstehen und Credit-Pakete per sicherem Stripe-Checkout kaufen.",
    },
    planner: {
      eyebrow: "Campaign Planning",
      title: "Campaign Planner",
      description:
        "Erstelle strukturierte Kampagnenpläne, Shot Prompts, Captions, Social Schedules und Safety Checklisten vor der Asset-Generierung.",
    },
    tools: {
      eyebrow: "Creator Platform",
      title: "Werkzeuge",
      description:
        "Wähle den passenden Kreativ-Workflow für deine nächste Kampagne — von Bildgenerierung und wiederverwendbaren Styles bis zu kommenden Video-, Planungs- und Brand-Safety-Tools.",
    },
  },
  toolsPage: {
    openInAgent: "Im Agent öffnen",
    includedModes: "Enthaltene Modi",
    roadmapOnly: "Geplanter Workflow",
    statuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Demnächst",
      planned: "Geplant",
    },
    imageModes: {
      standard: "Standard",
      fastDraft: "Fast Draft",
      ugcLook: "UGC Look",
      premium: "Premium",
      brandAssets: "Brand Assets",
      referenceEdit: "Reference Edit",
    },
    cards: {
      imageStudio: {
        title: "Bild Studio",
        benefit:
          "Kampagnenfertige Stills mit sechs Bild-Workflows — Standard, Draft, UGC, Premium, Brand und Reference Edit.",
      },
      videoStudio: {
        title: "Video Studio",
        benefit:
          "Verwandle statische Visuals in kurze Kampagnenvideos für Social Media, Produktlaunches und Creator Ads.",
      },
      creatorVideo: {
        title: "Creator Video",
        benefit:
          "Verwandle ein Bild und einen Prompt in ein kurzes AI-Creator-Video.",
      },
      lipSync: {
        title: "Lip Sync Studio",
        benefit:
          "Erstelle Talking-Head-Creator-Videos aus Skripten, Stimmen und Visual Assets — ideal für UGC-ähnliche Kampagnen.",
      },
      talkingCreator: {
        title: "Talking Creator",
        benefit:
          "Erstelle einen sprechenden Creator-Clip aus Bild, Skript und Stimme.",
      },
      cinemaAgent: {
        title: "Cinema Agent",
        benefit:
          "Szenenlisten, Shot-Planung und Visual Sequences vor der Generierung.",
      },
      omniCampaign: {
        title: "Omni Campaign Agent",
        benefit:
          "Ein Brief für Visuals, Video-Konzepte, Captions und exportfertige Assets.",
      },
      socialPlanner: {
        title: "Social Planner",
        benefit:
          "Plane Captions, Hashtags und Posting-Kalender für kommende Kampagnen.",
      },
      compliance: {
        title: "Compliance Check",
        benefit:
          "Pre-Publish-Checkliste für Claims, Logos, Disclosure und Brand Safety.",
      },
      watermarkedPromo: {
        title: "Wasserzeichen-Promo-Paket",
        benefit:
          "Günstige Exporte mit Wasserzeichen zum Testen — Voll-Export-Upgrade geplant.",
      },
    },
  },
  home: {
    chooseStudio: "Wähle dein Studio",
    chooseStudioSubline:
      "Starte mit Bildern, verwandle Assets in Videos oder erstelle sprechende Creator-Clips.",
    eyebrow: "Creator Command Center",
    welcome: "Willkommen zurück, Georgios",
    intro:
      "Erstelle dein nächstes Kampagnenvisual, arbeite mit deinen letzten Assets weiter oder verwalte deinen kreativen Workflow.",
    createVisual: "Visual erstellen",
    useTemplate: "Vorlage nutzen",
    addCredits: "Credits hinzufügen",
    promptPlaceholder:
      "Suche Vorlagen oder beschreibe dein nächstes Kampagnenvisual…",
    promptCreate: "Erstellen",
    studioToolsTitle: "Studio-Workflows",
    templatesTitle: "Mit Vorlage starten",
    templatesSubtitle:
      "Erprobte Prompts für Fitness, Beauty, UGC, Produkt, Restaurant und Brand-Kampagnen.",
    useTemplateCta: "Vorlage nutzen",
    recentAssetsTitle: "Neueste Assets",
    recentAssetsBody:
      "Arbeite mit deinen neuesten Kampagnenvisuals weiter.",
    recentAssetsEmpty:
      "Noch keine Assets. Erstelle dein erstes Kampagnenvisual im AI Create Studio.",
    createFirstVisual: "Image Studio öffnen",
    quickActionsPills: {
      useTemplate: "Vorlage nutzen",
      viewGallery: "Galerie öffnen",
      createStyleProfile: "Style Profile erstellen",
      addCredits: "Credits aufladen",
    },
    assetOpen: "Öffnen",
    assetVariant: "Variante erstellen",
    assetReference: "Als Referenz nutzen",
    assetDownload: "Download",
    statuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Demnächst",
    },
    metrics: {
      credits: "Credits verfügbar",
      assets: "Assets erstellt",
      favorites: "Favoriten",
      profiles: "Style Profiles",
      enoughFor: "Reicht für bis zu {count} Standard-Bilder.",
    },
    toolCards: {
      open: "Studio öffnen",
      start: "Studio öffnen",
      comingSoon: "Demnächst",
      imageStudio: {
        title: "Image Studio",
        body: "Erstelle kampagnenfähige Visuals für Social Media, Ads, Produktkampagnen und Creator Content.",
      },
      videoStudio: {
        title: "Video Studio",
        body: "Verwandle statische Visuals in kurze Kampagnenvideos für Social Media, Launches und Creator-Kampagnen.",
      },
      lipSync: {
        title: "Lip-Sync Studio",
        body: "Erstelle sprechende Creator-Clips aus Quellvideos, Skripten, Stimmen oder hochgeladenem Audio.",
      },
      creatorVideo: {
        title: "Creator Video",
        body: "Ein Quellbild und Prompt als kurzes AI-Creator-Video.",
      },
      talkingCreator: {
        title: "Talking Creator",
        body: "Sprechender Creator-Clip aus Bild, Skript und Stimme.",
      },
      motionTransfer: {
        title: "Motion Transfer",
        body: "Animiere ein Creator-Bild mit einem Driving-Video.",
      },
    },
    quickActions: [
      {
        title: "Create Campaign Visual",
        body: "Generiere ein einsatzbereites Visual für Social Media, Ads, Produktkampagnen oder Creator Content.",
        cta: "AI Agent öffnen",
      },
      {
        title: "Mit Vorlage starten",
        body: "Wähle eine erprobte Prompt-Vorlage für Fitness, Beauty, UGC, Produkt, Restaurant oder Brand-Kampagnen.",
        cta: "Vorlagen ansehen",
      },
      {
        title: "Style Profile erstellen",
        body: "Speichere eine wiederverwendbare Creative Direction für konsistente zukünftige Generierungen.",
        cta: "Profil erstellen",
      },
      {
        title: "Recent Assets fortsetzen",
        body: "Öffne deine letzten Visuals, erstelle Varianten oder nutze ein Asset als Referenz.",
        cta: "Galerie öffnen",
      },
      {
        title: "Credits hinzufügen",
        body: "Lade dein Guthaben auf und generiere weiter kampagnenfähige Visuals.",
        cta: "Pakete ansehen",
      },
    ],
    recommended: {
      title: "Empfohlener nächster Schritt",
      createProfile:
        "Erstelle vor deiner nächsten Generierung ein wiederverwendbares Style Profile für konsistente Ergebnisse.",
      createProfileCta: "Style Profile erstellen",
      lowCreditsTitle: "Deine Credits werden knapp",
      lowCreditsBody:
        "Lade Credits jetzt auf, um ohne Unterbrechung weiter zu generieren.",
      lowCreditsCta: "Credits hinzufügen",
      variantTitle: "Mache aus deinem besten Ergebnis neue Varianten",
      variantBody:
        "Nutze deinen letzten Favoriten als Referenz und teste eine neue Kampagnenrichtung.",
      variantCta: "Variante erstellen",
    },
    heroTitle: "Was möchtest du heute erstellen?",
    heroSubtitle:
      "Wähle einen Workflow, starte mit einem Prompt oder arbeite mit deinen letzten Assets weiter.",
  },
  toolRail: {
    home: "Home",
    imageStudio: "Image Studio",
    videoStudio: "Video Studio",
    lipSync: "Lip Sync",
    creatorVideo: "Creator Video",
    talkingCreator: "Talking Creator",
    motionTransfer: "Motion Transfer",
    gallery: "Asset Gallery",
    styleProfiles: "Style Profiles",
    credits: "Credits",
    toolsOverview: "Tools",
    plannedSection: "Geplant",
    cinemaAgent: "Cinema Agent",
    omniAgent: "Omni Campaign Agent",
    socialPlanner: "Social Planner",
    compliance: "Compliance",
    watermark: "Watermark",
  },
  workspaces: {
    statuses: {
      live: "Live",
      beta: "Beta",
      comingSoon: "Demnächst",
      planned: "Geplant",
    },
    modelTitle: "Modell",
    image: {
      eyebrow: "Image Studio",
      title: "Image Studio",
      subtitle:
        "Erstelle kampagnenfähige Visuals für Social Media, Ads, Produktkampagnen und Creator Content.",
      headline: "Erstelle dein nächstes Kampagnenvisual.",
    },
    video: {
      eyebrow: "Video Studio",
      title: "Video Studio",
      subtitle: "Verwandle ein Quellbild in ein kurzes Kampagnenvideo.",
      headline: "Generiere dein Kampagnenvideo.",
      modelName: "Kling Image-to-Video",
      modelId: "fal-ai/kling-video/v2.1/standard/image-to-video",
      credits: "25 Credits",
      addSourceImage: "Quellbild hinzufügen",
      motionPrompt: "Motion Prompt",
      generateVideo: "Video generieren",
    },
    lip_sync: {
      eyebrow: "Lip Sync Studio",
      title: "Lip Sync Studio",
      subtitle:
        "Erstelle Talking-Head-Creator-Videos aus Quellvideo und Stimme.",
      headline: "Generiere dein Lip-Sync-Video.",
      modelName: "Sync Lip Sync Pro",
      modelId: "fal-ai/sync-lipsync/v2/pro",
      credits: "30–35 Credits",
      addSourceVideo: "Quellvideo hinzufügen",
      generateLipSync: "Lip Sync generieren",
    },
    creator_video: {
      eyebrow: "Creator Video",
      title: "Creator Video",
      subtitle: "Ein Quellbild und Prompt als kurzes AI-Creator-Video.",
      headline: "Generiere dein Creator Video.",
      pipeline: "Nano Banana Pro Edit → Kling Image-to-Video",
      credits: "40 Credits",
      addSourceImage: "Quellbild hinzufügen",
      creativePrompt: "Creative Prompt",
      generate: "Creator Video generieren",
    },
    talking_creator: {
      eyebrow: "Talking Creator",
      title: "Talking Creator",
      subtitle:
        "Sprechendes Creator-Video aus einem Bild, Skript und gewählter Stimme.",
      headline: "Generiere deinen Talking-Creator-Clip.",
      pipeline: "Image-to-Video · ElevenLabs Voice · Lip Sync",
      credits: "60 Credits",
      addSourceImage: "Quellbild hinzufügen",
      generate: "Talking Creator generieren",
    },
    motion_transfer: {
      eyebrow: "Motion Transfer",
      title: "Motion Transfer",
      subtitle: "Animiere ein Creator-Bild mit einem Driving-Video.",
      addCharacter: "Charakter hinzufügen",
      addMotion: "Expression & Motion hinzufügen",
      stepCharacter: "Schritt 1: Charakterbild hinzufügen",
      stepMotion: "Schritt 2: Driving-Video hinzufügen",
      stepGenerate: "Schritt 3: Motion Transfer generieren",
      generateButton: "Motion generieren",
      comingSoonNote: "Demnächst — in dieser Vorschau keine Credits.",
      modelTitle: "Modell",
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
    title: "Erstelle dein nächstes Kampagnenvisual.",
    subtitle:
      "Beschreibe deine Idee, wähle einen visuellen Modus und generiere ein einsatzbereites Asset für Social Media, Werbung, Produktkampagnen oder Creator Content.",
    enterHint: "Enter zum Generieren · Shift+Enter für neue Zeile",
    workspacePromptHeadline: "Was möchtest du erstellen?",
    searchHeadline: "Erstelle dein nächstes Kampagnenvisual.",
    imageStudioTab: "Bild Studio",
    resultPlaceholderTitle: "Dein Ergebnis erscheint hier.",
    resultPlaceholderHint:
      "Generiere ein Visual für die Live-Vorschau. Fertige Assets werden automatisch in deiner Gallery gespeichert.",
    generateButton: "Visual generieren",
    processingTitle: "Dein Kampagnenvisual wird erstellt…",
    processingStepBrief: "Kampagnenbriefing analysieren",
    processingStepDirection: "Visuelle Richtung anwenden",
    processingStepFormat: "Social-Media-Format vorbereiten",
    processingStepGenerating: "Finales Visual generieren",
    processingStepSaving: "In der Asset Gallery speichern",
    promptTip:
      "Tipp: Beschreibe Produkt, Zielgruppe, Stimmung, Plattform und visuellen Stil für bessere Ergebnisse.",
    creditPreview:
      "Diese Generierung verwendet {cost} Credits. Danach bleiben dir {remaining} Credits.",
    creditPreviewShort: "Diese Generierung verwendet {cost} Credits.",
    resultReadyTitle: "Dein Kampagnenvisual ist fertig.",
    resultReadyBody:
      "Lade es herunter, erstelle eine Variante oder nutze es als Referenz für dein nächstes Asset.",
    createVariant: "Variante erstellen",
    useAsReference: "Als Referenz nutzen",
    generateAnotherFormat: "Anderes Format generieren",
    saveFavorite: "Favorit speichern",
    openGallery: "In Galerie öffnen",
    imageModeChips: {
      standard: "Standard 1C",
      fastDraft: "Fast Draft 1C",
      ugcLook: "UGC Look 2C",
      premium: "Premium 3C",
      brandAssets: "Brand Assets 4C",
      referenceEdit: "Reference Edit 5C",
    },
    promptPlaceholder:
      "Beispiel: Erstelle eine hochwertige Fitness-Creator-Kampagne für Instagram mit selbstbewusster Athletin, Premium-Sportswear, cineastischem Gym-Licht und klarem Produktfokus…",
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
    imageModeUGCLookActiveNote: "UGC Look · Beta · 2 Credits",
    imageModeFastDraftActiveNote: "Fast Draft · Beta · 1 Credit",
    imageModePremiumActiveNote: "Premium Image · Beta · 3 Credits",
    imageModeReferenceEditActiveNote: "Reference Edit · Beta · 5 Credits",
    imageModeBrandAssetsActiveNote: "Brand Assets · Beta · 4 Credits",
    imageModeVideoStudioActiveNote: "Video Studio · Beta · 25 Credits",
    imageModeCreatorVideoActiveNote: "Creator Video · Beta · 40 Credits",
    imageModeTalkingCreatorActiveNote: "Talking Creator · Beta · 60 Credits",
    studioTabImage: "Image Studio",
    studioTabVideo: "Video Studio",
    studioTabVideoPlanned: "Video Studio · Demnächst",
    studioTabCreatorVideo: "Creator Video",
    studioTabCreatorVideoPlanned: "Creator Video · Demnächst",
    studioTabTalkingCreator: "Talking Creator",
    studioTabTalkingCreatorPlanned: "Talking Creator · Demnächst",
    studioTabLipSync: "Lip Sync",
    studioTabLipSyncPlanned: "Lip Sync · Demnächst",
    creatorVideoMissingSource: "Quellbild erforderlich",
    creatorVideoMissingPrompt: "Prompt erforderlich",
    creatorVideoLongerHint:
      "Verwandle ein Bild und einen Prompt in ein kurzes AI-Creator-Video.",
    generateCreatorVideo: "Creator Video generieren",
    talkingCreatorMissingSource: "Lade ein Quellbild für Talking Creator hoch.",
    talkingCreatorMissingScript: "Skript für Talking Creator erforderlich.",
    talkingCreatorMissingVoice: "Wähle eine Stimme für Talking Creator.",
    talkingCreatorLongerHint:
      "Talking Creator kann länger dauern als die Bild-Generierung.",
    generateTalkingCreator: "Talking Creator generieren",
    lipSyncMissingSource: "Bitte lade ein Quellvideo hoch.",
    lipSyncMissingAudio: "Bitte lade eine Audiodatei hoch.",
    lipSyncMissingScript: "Bitte gib ein Skript ein.",
    lipSyncMissingVoice: "Bitte wähle eine Stimme.",
    lipSyncInvalidVoice: "Ungültige Stimme ausgewählt.",
    lipSyncFailedRefunded:
      "Lip Sync fehlgeschlagen. Deine Credits wurden erstattet.",
    lipSyncUploadingFiles: "Dateien werden hochgeladen…",
    lipSyncWaitForVideoUpload:
      "Bitte warte, bis der Video-Upload abgeschlossen ist.",
    lipSyncWaitForAudioUpload:
      "Bitte warte, bis der Audio-Upload abgeschlossen ist.",
    lipSyncSystemVoicesNotConfigured:
      "System-Stimmen sind noch nicht konfiguriert. Nutze stattdessen Audio-Upload.",
    lipSyncLongerHint:
      "Lip Sync kann länger dauern als Bild-Generierung.",
    generateLipSync: "Lip Sync erstellen",
    lipSyncCreditsUpload: "30 Credits mit eigener Audiodatei",
    lipSyncCreditsVoice: "35 Credits mit KI-Stimme",
    imageModeLipSyncActiveNote: "Lip Sync Studio · Beta · 30-35 Credits",
    videoStudioMissingSource:
      "Lade ein Quellbild für Video Studio hoch.",
    videoStudioMissingMotion:
      "Füge einen Motion-Prompt für Video Studio hinzu.",
    videoStudioLongerHint:
      "Video-Generierung kann länger dauern als Bild-Generierung.",
    generateVideo: "Video generieren",
    openVideo: "Video öffnen",
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
      "Cinema Agent",
      "Omni Campaign Agent",
      "Social Planner",
      "Brand Safety / Compliance",
    ],
    futureModulesPlannedNote:
      "Geplante Module — nur Vorschau. Keine API, Credits oder Provider-Calls.",
    imageModes: {
      standard: {
        label: "Standard",
        description: "Zuverlässiges Kampagnenvisual für den Alltag.",
        creditLine: "Standard — 1 Credit",
      },
      ugcLook: {
        label: "UGC Look",
        description:
          "Authentisches Creator-Visual für Social Media und Ads.",
        creditLine: "UGC Look — 2 Credits",
        hoverHint:
          "Ideal für lockere Creator-Posts, Produktempfehlungen und realistischen Social Content.",
      },
      fastDraft: {
        label: "Fast Draft",
        description: "Schneller Konzepttest vor finalen Assets.",
        creditLine: "Fast Draft — 1 Credit",
      },
      premium: {
        label: "Premium",
        description:
          "High-End-Kampagnenbild mit stärkerem Styling, Detail und Finish.",
        creditLine: "Premium — 3 Credits",
      },
      referenceEdit: {
        label: "Reference Edit",
        description: "Referenzbild zur Steuerung des finalen Ergebnisses.",
        creditLine: "Reference Edit — 5 Credits",
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
          "Visuals passend zu Marke, Produkt oder Kampagnenrichtung.",
        creditLine: "Brand Assets — 4 Credits",
        hoverHint:
          "Brand Assets unterstützt Ad Creatives, Produktkampagnen-Layouts, Thumbnails und Social-Marketing-Visuals.",
      },
      lipSync: {
        label: "Lip Sync Studio",
        description:
          "Synchronisiere ein Creator-Video mit eigener Audiodatei oder KI-Stimme.",
        panel: {
          statusPlanned: "Demnächst · Geplant",
          statusActive: "Beta",
          introPlanned:
            "Lip Sync Studio ist demnächst verfügbar. Wenn aktiv, kostet es 30 Credits pro Job.",
          introActive:
            "Synchronisiere ein Creator-Video mit eigener Audiodatei oder KI-Stimme.",
          sourceLabel: "Quellvideo",
          sourceVideoLabel: "Quellvideo",
          sourceVideoPlaceholder: "Source-Video-URL einfügen",
          sourceVideoHint:
            "Du kannst eine Video-URL aus dem Video Studio oder der Asset Gallery verwenden.",
          sourcePlaceholder: "Quellvideo hochladen",
          sourceHint: "Video: MP4/WebM/MOV · max. 50 MB",
          uploadSource: "Quellmedien hochladen",
          audioLabel: "Audio",
          audioPlaceholder: "Audiospur hochladen",
          audioHint: "MP3, WAV, AAC, OGG, M4A, WebM · max. 25 MB",
          uploadAudio: "Audio hochladen",
          uploading: "Wird hochgeladen…",
          clearSource: "Quelle entfernen",
          clearAudio: "Audio entfernen",
          invalidSource: "Nicht unterstützte Quelldatei.",
          invalidAudio: "Nicht unterstützte Audiodatei.",
          sourceTooLarge: "Quelldatei zu groß (max. 50 MB).",
          audioTooLarge: "Audiodatei zu groß (max. 25 MB).",
          uploadFailed: "Upload fehlgeschlagen. Bitte erneut versuchen.",
          instructionsLabel: "Anweisungen (optional)",
          instructionsPlaceholder:
            "Beschreibe Ausdruck, Energie oder Szenenstimmung…",
          inputModeSystemVoice: "KI-Stimme",
          inputModeUploadAudio: "Audio hochladen",
          voiceLibrary: "Voice Library",
          recommendedVoices: "Empfohlene Stimmen",
          femaleVoices: "Weibliche Stimmen",
          maleVoices: "Männliche Stimmen",
          categoryVoiceStyles: "Kategorie-Voice-Styles",
          preview: "Vorschau",
          previewListen: "Anhören",
          notConfiguredYet: "Noch nicht konfiguriert",
          previewNotAvailable: "Vorschau noch nicht verfügbar",
          scriptLabel: "Script für KI-Stimme",
          scriptPlaceholder: "Schreibe, was der Creator sagen soll…",
          voiceLabel: "Stimme",
          scriptRequired: "Skript erforderlich",
          scriptCommandBarHint:
            "Du kannst das Skript auch in der Command Bar oben bearbeiten.",
          selectedVoiceLabel: "Ausgewählte Stimme",
          sourceUploadedReady: "Video hochgeladen — bereit zum Generieren.",
          systemVoicesNotConfigured:
            "System-Stimmen sind noch nicht konfiguriert.",
          uploadAudioInstead: "Nutze stattdessen Audio-Upload.",
          usePreviousVideo: "Vorheriges Video verwenden",
          activeNote:
            "Audio-Upload (30 Credits) oder KI-Stimme + Skript (35 Credits).",
        },
      },
      videoStudio: {
        label: "Video Studio",
        description:
          "Animiere ein Quellbild zu einem kurzen cinematic Social-Video.",
        panel: {
          statusPlanned: "Demnächst · Geplant",
          statusActive: "Beta",
          introPlanned:
            "Video Studio wird für Image-to-Video vorbereitet.",
          introActive:
            "Lade ein Quellbild hoch und beschreibe die Bewegung. Dein Video erscheint im Agent und in der Galerie.",
          sourceLabel: "Quellbild",
          sourcePlaceholder: "Quellbild zum Animieren hochladen",
          sourceHint: "PNG, JPEG oder WebP · max. 12 MB",
          uploadSourceImage: "Quellbild hochladen",
          uploading: "Wird hochgeladen…",
          clearImage: "Bild entfernen",
          invalidFile: "Bitte JPEG, PNG oder WebP wählen.",
          fileTooLarge: "Bild zu groß (max. 12 MB).",
          uploadFailed: "Upload fehlgeschlagen. Bitte erneut versuchen.",
          motionLabel: "Motion-Prompt",
          motionPlaceholder:
            "Beschreibe Kamerabewegung, Stimmung und Szenenenergie…",
          motionHint: "Pflichtfeld — beschreibe, wie sich das Bild bewegen soll.",
          activeNote:
            "Video Studio animiert dein Quellbild zu einem 5-Sekunden-Kampagnenclip.",
        },
      },
      creatorVideo: {
        label: "Creator Video",
        description:
          "Verwandle ein Quellbild und einen Prompt in ein kurzes AI-Creator-Video.",
        panel: {
          statusPlanned: "Demnächst · Geplant",
          statusActive: "Beta",
          introPlanned:
            "Creator Video wird für die Nano Banana + Kling Pipeline vorbereitet.",
          introActive:
            "Lade ein Quellbild hoch, ergänze deinen Creative Prompt und generiere ein kurzes AI-Creator-Video.",
          sourceLabel: "Quellbild",
          sourcePlaceholder: "Quellbild hochladen",
          sourceHint: "PNG, JPEG oder WebP · max. 12 MB",
          uploadSourceImage: "Quellbild hochladen",
          uploading: "Wird hochgeladen…",
          clearImage: "Bild entfernen",
          invalidFile: "Bitte JPEG, PNG oder WebP wählen.",
          fileTooLarge: "Bild zu groß (max. 12 MB).",
          uploadFailed: "Upload fehlgeschlagen. Bitte erneut versuchen.",
          creativePromptLabel: "Creative Prompt",
          creativePromptPlaceholder:
            "Erstelle ein realistisches AI-Creator-Video-Portrait, natürliches Gesicht, Premium-Fashion-Look, subtile Bewegung, Social-Media-Creator-Ästhetik…",
          creativePromptHint:
            "Pflichtfeld — beschreibe Stil und Stimmung des Creator-Videos.",
          activeNote:
            "Dies erstellt ein kurzes AI-Creator-Video aus einem Bild und Prompt. Kosten: 40 Credits.",
        },
      },
      talkingCreator: {
        label: "Talking Creator",
        description:
          "One-Click-Modus: Bild + Skript + Stimme zu einem sprechenden Creator-Video.",
        panel: {
          statusPlanned: "Demnächst · Geplant",
          statusActive: "Beta",
          introPlanned:
            "Talking Creator wird für One-Click Talking Videos vorbereitet.",
          introActive:
            "Lade ein Quellbild hoch, füge dein Skript hinzu, wähle eine Stimme und generiere einen Talking-Creator-Clip.",
          sourceLabel: "Quellbild",
          sourcePlaceholder: "Quellbild hochladen",
          sourceHint: "PNG, JPEG oder WebP · max. 12 MB",
          uploadSourceImage: "Quellbild hochladen",
          uploading: "Wird hochgeladen…",
          clearImage: "Bild entfernen",
          invalidFile: "Bitte JPEG, PNG oder WebP wählen.",
          fileTooLarge: "Bild zu groß (max. 12 MB).",
          uploadFailed: "Upload fehlgeschlagen. Bitte erneut versuchen.",
          scriptLabel: "Skript",
          scriptPlaceholder: "Gib den gesprochenen Text für dein Creator-Video ein…",
          voiceLabel: "Stimme",
          voiceLibrary: "Voice Library",
          recommendedVoices: "Empfohlene Stimmen",
          femaleVoices: "Weibliche Stimmen",
          maleVoices: "Männliche Stimmen",
          categoryVoiceStyles: "Kategorie-Voice-Styles",
          preview: "Vorschau",
          previewListen: "Anhören",
          notConfiguredYet: "Noch nicht konfiguriert",
          previewNotAvailable: "Vorschau noch nicht verfügbar",
          activeNote:
            "Dies erstellt ein sprechendes Creator-Video aus einem Bild. Kosten: 60 Credits.",
        },
      },
      live: "Live",
      beta: "Beta",
      oneCredit: "1 Credit",
      twoCredits: "2 Credits",
      threeCredits: "3 Credits",
      fourCredits: "4 Credits",
      fiveCredits: "5 Credits",
      twentyFiveCredits: "25 Credits",
      thirtyCredits: "30 Credits",
      fortyCredits: "40 Credits",
      sixtyCredits: "60 Credits",
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
    generatingVideo: "Dein Video wird generiert…",
    generatingCreatorVideo: "Dein Creator-Video wird generiert…",
    generatingTalkingCreator: "Dein Talking-Creator-Video wird generiert…",
    generatingLipSync: "Dein Lip-Sync-Video wird generiert…",
    completed: "Generierung abgeschlossen",
    failed: "Generierung fehlgeschlagen",
    openImage: "Bild öffnen",
    viewInGallery: "In Gallery ansehen",
    createAnother: "Weiteres erstellen",
    suggestedCaptionTitle: "Caption-Vorschlag",
    suggestedCaptionSubtitle: "Caption für deinen Post",
    suggestedCaptionCopy: "Caption kopieren",
    suggestedCaptionCopied: "Kopiert",
    socialPlannerTitle: "Social Planner",
    socialPlannerSubtitle: "Dieses Asset planen (kein Auto-Posting)",
    socialPlannerDateLabel: "Datum",
    socialPlannerTimeLabel: "Uhrzeit",
    socialPlannerAdd: "Zum Plan hinzufügen",
    socialPlannerCopyCaption: "Caption kopieren",
    socialPlannerCopyPlan: "Plan kopieren",
    socialPlannerAdded: "Zum Plan hinzugefügt",
    complianceTitle: "Compliance-Checkliste",
    complianceSubtitle: "Schnelle Pre-Publish-Checkliste",
    complianceItemNoFakeText: "Kein unerwünschter / Fake-Text",
    complianceItemNoFakeLogo: "Keine Fake-Logos / Brands",
    complianceItemNoArtifacts: "Keine offensichtlichen AI-Artefakte",
    complianceItemDisclosure: "AI-Disclosure Reminder (falls nötig)",
    complianceMarkReviewed: "Als geprüft markieren",
    complianceReviewed: "Geprüft",
    cinemaAgentTitle: "Cinema Agent (Planung)",
    cinemaAgentSubtitle: "Erstelle einen 5-Shot-Kampagnenplan.",
    omniAgentTitle: "Omni Campaign Agent (Planung)",
    omniAgentSubtitle: "Erstelle einen 7-Tage-Kampagnen-Rollout-Plan.",
    copyPlan: "Plan kopieren",
    planCopied: "Plan kopiert",
    processingHint:
      "Wir wenden den ausgewählten Modus, das Style Profile und das Format an, um ein einsatzbereites Asset zu generieren.",
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
    generationAlreadyProcessing:
      "Eine Generierung läuft bereits. Bitte warte, bis sie abgeschlossen ist.",
    activeGenerationLimitTitle: "Du hast bereits aktive Generierungen.",
    activeGenerationLimitIntro:
      "Bitte warte, bis eine davon abgeschlossen ist.",
    creditsRefundedHint: "Credits wurden erstattet.",
    promptLoadedRegeneration: "Prompt für Regenerierung geladen.",
    campaignPromptLoaded: "Kampagnen-Prompt in den AI Agent geladen.",
  },
  gallery: {
    loading: "Asset Gallery wird geladen…",
    empty: "Keine Assets passen zu deinen Filtern.",
    emptyTitle: "Noch keine Assets",
    emptyBody:
      "Erstelle dein erstes Kampagnenvisual im AI Agent — es erscheint automatisch hier.",
    emptyCta: "Erstes Visual erstellen",
    searchEmptyTitle: "Keine passenden Assets gefunden",
    searchEmptyBody:
      "Probiere ein anderes Stichwort, einen anderen Status-Filter oder ein Style Profile.",
    searchPlaceholder: "Prompts oder Ideen suchen…",
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
    lipSyncBadge: "Lip Sync",
    creatorVideoBadge: "Creator Video",
    talkingCreatorBadge: "Talking Creator",
    videoBadge: "Video",
    ugcLookBadge: "UGC-Look",
    videoUnavailable: "Video nicht verfügbar",
    noVideoUrl: "Diese Generierung hat keine Video-URL.",
    openVideoDirectly: "Video direkt öffnen",
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
    profileNamePlaceholder: "z. B. Premium Fitness Creator",
    creativeTag: "Creative Tag (optional)",
    creativeTagPlaceholder: "z. B. Fitness · UGC · Product · Luxury",
    profileSummary: "Profil-Zusammenfassung",
    profileSummaryPlaceholder:
      "Beschreibe, wofür dieses Profil genutzt werden soll — Kampagnentyp, Zielgruppe, Markenstimmung oder Creator-Stil.",
    guidanceTitle: "So funktionieren Style Profiles",
    guidanceBody:
      "Style Profiles steuern die visuelle Richtung deiner Generierungen — inklusive Stimmung, Styling, Bildaufbau und Markenlook. Sie helfen dabei, konsistente Ergebnisse zu erzeugen, ohne feste Identitätsmodelle zu erstellen.",
    creativeDirection: "Creative Direction",
    appearanceDirection: "Appearance Direction",
    appearancePlaceholder:
      "Beschreibe Erscheinungsbild, Wardrobe, Framing, Licht, Posen und wiederkehrende visuelle Details.",
    moodDirection: "Mood Direction",
    moodPlaceholder:
      "Beschreibe die emotionale Tonalität: premium, energiegeladen, natürlich, cineastisch, clean, bold, elegant oder authentisch.",
    brandDirectionLabel: "Brand Direction",
    brandPlaceholder:
      "Markenfarben, Produktfokus, visuelle Regeln sowie Do's and Don'ts für konsistente Ergebnisse.",
    negativeDirectionLabel: "Negative Direction",
    negativePlaceholder:
      "Was vermieden werden soll, z. B. unrealistische Haut, verzerrte Hände, falsche Logos, billiges Licht oder Off-Brand-Farben.",
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
      "Wähle das passende Credit-Paket für deinen kreativen Workflow und erstelle Kampagnenvisuals mit transparenter Nutzung. Standardbilder starten ab 1 Credit.",
    modeUsageIntro:
      "Credits werden je nach gewähltem Modus verbraucht.",
    workflowChargeNote:
      "Credits werden je gewähltem Workflow verbraucht.",
    modeCosts: {
      standard: "Standard Image: 1 Credit",
      ugcLook: "UGC Look: 2 Credits",
      fastDraft: "Fast Draft: 1 Credit",
      premium: "Premium Image: 3 Credits",
      referenceEdit: "Reference Edit: 5 Credits",
      brandAssets: "Brand Assets: 4 Credits",
      videoStudio: "Video Studio: 25 Credits",
      creatorVideo: "Creator Video: 40 Credits",
      lipSync: "Lip Sync Studio: 30-35 Credits",
      talkingCreator: "Talking Creator: 60 Credits",
    },
    lipSyncUsageNote:
      "Lip Sync nutzt Quellvideo + Audio-Upload (30) oder System Voice (35).",
    oneCreditRule: "1 Standard-Bild = 1 Credit",
    availableCredits: "Verfügbare Credits",
    refreshing: "Guthaben wird aktualisiert…",
    refreshBalance: "Guthaben aktualisieren",
    buyCreditsCta: "Credits kaufen",
    upgradeCreditsCta: "Credits aufladen",
    creditPackages: "Credit-Pakete",
    choosePlan: "Wähle einen Plan für deinen Workflow",
    secureCheckout: "Sichere Zahlung über Stripe",
    modeCostsLabel: "Kosten je Modus",
    price: "Preis",
    creditsIncluded: "Enthaltene Credits",
    creditsUnit: "Credits",
    standardImages:
      "≈ {count} Standard-Bilder (1 Bild = 1 Credit)",
    redirecting: "Weiterleitung zum Checkout…",
    customTopUpTitle: "Individuelle Credits aufladen",
    customTopUpIntro:
      "Du brauchst eine flexible Menge? Lade individuelle Credits ab 100 Credits auf.",
    customTopUpPricePerCredit: "Individuelle Credits kosten 0,10 € pro Credit.",
    customTopUpExamples:
      "Beispiele: 100 Credits = 10 €, 250 Credits = 25 €, 1000 Credits = 100 €.",
    customTopUpPackageHint: "Größere Pakete bieten den besseren Preisvorteil.",
    customTopUpLabel: "Individuelle Credits",
    customTopUpPlaceholder: "100",
    customTopUpBuy: "Individuelle Credits kaufen",
    customTopUpMinError: "Mindestaufladung sind 100 Credits.",
    customTopUpMaxError: "Maximal 10000 Credits pro Aufladung.",
    footerNote:
      "Credits werden nach erfolgreicher Zahlung gutgeschrieben. Ungenutzte Credits bleiben auf deinem Guthaben, bis sie im AI Agent verwendet werden.",
    recommended: "Empfohlen",
    mostPopular: "Am beliebtesten",
    trustNotes: [
      "Sichere Zahlung über Stripe",
      "Transparente Credit-Nutzung",
      "Credits werden vor jeder Generierung angezeigt",
      "Assets werden in deiner Galerie gespeichert",
      "Lade deine generierten Visuals herunter",
    ],
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
          "Entdecke InfluExAi, teste Prompts und erstelle erste Kampagnenvisuals, bevor du skalierst.",
        benefits: [
          "100 Credits enthalten",
          "AI Agent Bildgenerierung",
          "Social-Media-Format-Presets",
          "Asset Gallery Speicherung",
          "Ideal für erste Tests und frühe Ideen",
        ],
        button: "Mit Starter starten",
      },
      professional: {
        tagline: "Empfohlen für regelmäßige Creator",
        description:
          "Die beste Wahl für kontinuierliche Produktion, wiederverwendbare Style Profiles und regelmäßige Kampagnenvisuals.",
        benefits: [
          "Alles aus Starter",
          "Style Profiles für wiederverwendbare Creative Direction",
          "Für wöchentliche Creator-Workflows",
          "Bestes Preis-Leistungs-Verhältnis",
        ],
        button: "Professional wählen",
      },
      ultimate: {
        tagline: "Für Teams & High-Volume-Workflows",
        description:
          "Skaliere Kampagnenproduktion mit großer Credit-Reserve für Unternehmen, Agenturen und Power User.",
        benefits: [
          "Alles aus Professional",
          "High-Volume Generierung",
          "Geeignet für Teams und Agenturen",
          "Ideal für das Testen mehrerer Creative-Richtungen",
        ],
        button: "Mit Ultimate skalieren",
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
