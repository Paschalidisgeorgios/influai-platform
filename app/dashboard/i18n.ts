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
      "Campaign orchestration and compliance tools — preview only. No API, credits or billing.",
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
      "Image modes run in the AI Agent. Modules below are roadmap previews — not separate pages.",
    creditCostShort: "Credits",
    nav: {
      agent: { label: "AI Agent", description: "Generate campaign visuals" },
      gallery: { label: "Asset Gallery", description: "Manage generated assets" },
      characters: {
        label: "Style Profiles",
        description: "Reusable creative direction",
      },
      credits: { label: "Credits", description: "Balance and packages" },
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
          "Plan posts and campaign calendars — preview only, no social posting API.",
      },
      brandSafety: {
        label: "Brand Safety / Compliance",
        description:
          "Policy checks and compliance hints for campaign assets.",
      },
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
    planner: {
      eyebrow: "Campaign Planning",
      title: "Campaign Planner",
      description:
        "Create structured campaign plans, shot prompts, captions, social schedules and safety checklists before generating assets.",
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
    workspacePromptHeadline: "What do you want to create?",
    searchHeadline: "Hey, what do you want to create?",
    imageStudioTab: "Image Studio",
    resultPlaceholderTitle: "Your result will appear here.",
    resultPlaceholderHint:
      "Generate a visual to preview it live. Completed assets are saved to your gallery automatically.",
    generateButton: "Generate",
    processingStepBrief: "Preparing creative brief…",
    processingStepDirection: "Rendering visual direction…",
    processingStepFormat: "Optimizing social format…",
    processingStepSaving: "Saving asset to gallery…",
    imageModeChips: {
      standard: "Standard 1C",
      fastDraft: "Fast Draft 1C",
      ugcLook: "UGC Look 2C",
      premium: "Premium 3C",
      brandAssets: "Brand Assets 4C",
      referenceEdit: "Reference Edit 5C",
    },
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
    imageModeUGCLookActiveNote: "UGC Look · Beta · 2 Credits",
    imageModeFastDraftActiveNote: "Fast Draft · Beta · 1 Credit",
    imageModePremiumActiveNote: "Premium Image · Beta · 3 Credits",
    imageModeReferenceEditActiveNote: "Reference Edit · Beta · 5 Credits",
    imageModeBrandAssetsActiveNote: "Brand Assets · Beta · 4 Credits",
    imageModeVideoStudioActiveNote: "Video Studio · Beta · 25 Credits",
    studioTabImage: "Image Studio",
    studioTabVideo: "Video Studio",
    studioTabVideoPlanned: "Video Studio · Coming soon",
    studioTabLipSync: "Lip Sync Studio",
    studioTabLipSyncPlanned: "Lip Sync Studio · Coming soon",
    lipSyncMissingSource: "Upload source media for Lip Sync Studio.",
    lipSyncMissingAudio: "Upload audio for Lip Sync Studio.",
    lipSyncLongerHint:
      "Lip Sync may take longer than image generation.",
    generateLipSync: "Generate Lip Sync",
    imageModeLipSyncActiveNote: "Lip Sync Studio · Beta · 30 Credits",
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
        label: "Standard Image",
        description:
          "Reliable campaign visuals powered by the production image workflow.",
      },
      ugcLook: {
        label: "UGC Look",
        description:
          "Authentic smartphone-style creator visuals for TikTok, Reels and organic ads.",
        hoverHint:
          "Best for casual creator posts, product recommendations and realistic social content.",
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
      lipSync: {
        label: "Lip Sync Studio",
        description:
          "Generate talking creator clips from scripts, voice and visual assets.",
        panel: {
          statusPlanned: "Coming soon · Planned",
          statusActive: "Beta",
          introPlanned:
            "Lip Sync Studio is planned. Estimated 20–80 credits depending on duration.",
          introActive:
            "Upload source media and audio. Your lip-synced video appears in the agent and gallery.",
          sourceLabel: "Source media",
          sourcePlaceholder: "Upload image or video",
          sourceHint: "Image: PNG/JPEG/WebP · Video: MP4/WebM/MOV · max 50 MB",
          uploadSource: "Upload source media",
          audioLabel: "Audio",
          audioPlaceholder: "Upload audio track",
          audioHint: "MP3, WAV, AAC, OGG, M4A · max 25 MB",
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
          activeNote:
            "Lip Sync uses your source media and audio — no text-to-speech.",
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
      live: "Live",
      beta: "Beta",
      oneCredit: "1 Credit",
      twoCredits: "2 Credits",
      threeCredits: "3 Credits",
      fourCredits: "4 Credits",
      fiveCredits: "5 Credits",
      twentyFiveCredits: "25 Credits",
      thirtyCredits: "30 Credits",
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
    lipSyncBadge: "Lip Sync",
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
      lipSync: "Lip Sync Studio: Planned (20–80 Credits)",
    },
    lipSyncUsageNote: "Lip Sync uses source media and audio input.",
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
      "Kampagnen-Orchestrierung und Compliance — nur Vorschau. Keine API, Credits oder Abrechnung.",
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
      "Bildmodi laufen im AI Agent. Module unten sind Roadmap-Vorschau — keine eigenen Seiten.",
    creditCostShort: "Credits",
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
    planner: {
      eyebrow: "Campaign Planning",
      title: "Campaign Planner",
      description:
        "Erstelle strukturierte Kampagnenpläne, Shot Prompts, Captions, Social Schedules und Safety Checklisten vor der Asset-Generierung.",
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
    workspacePromptHeadline: "Was möchtest du erstellen?",
    searchHeadline: "Hey, was möchtest du erschaffen?",
    imageStudioTab: "Bild Studio",
    resultPlaceholderTitle: "Dein Ergebnis erscheint hier.",
    resultPlaceholderHint:
      "Generiere ein Visual für die Live-Vorschau. Fertige Assets werden automatisch in deiner Gallery gespeichert.",
    generateButton: "Generieren",
    processingStepBrief: "Creative Brief wird vorbereitet…",
    processingStepDirection: "Visuelle Direction wird gerendert…",
    processingStepFormat: "Social Format wird optimiert…",
    processingStepSaving: "Asset wird in der Gallery gespeichert…",
    imageModeChips: {
      standard: "Standard 1C",
      fastDraft: "Fast Draft 1C",
      ugcLook: "UGC Look 2C",
      premium: "Premium 3C",
      brandAssets: "Brand Assets 4C",
      referenceEdit: "Reference Edit 5C",
    },
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
    imageModeUGCLookActiveNote: "UGC Look · Beta · 2 Credits",
    imageModeFastDraftActiveNote: "Fast Draft · Beta · 1 Credit",
    imageModePremiumActiveNote: "Premium Image · Beta · 3 Credits",
    imageModeReferenceEditActiveNote: "Reference Edit · Beta · 5 Credits",
    imageModeBrandAssetsActiveNote: "Brand Assets · Beta · 4 Credits",
    imageModeVideoStudioActiveNote: "Video Studio · Beta · 25 Credits",
    studioTabImage: "Image Studio",
    studioTabVideo: "Video Studio",
    studioTabVideoPlanned: "Video Studio · Demnächst",
    studioTabLipSync: "Lip Sync Studio",
    studioTabLipSyncPlanned: "Lip Sync Studio · Demnächst",
    lipSyncMissingSource:
      "Lade Quellmedien für Lip Sync Studio hoch.",
    lipSyncMissingAudio: "Lade Audio für Lip Sync Studio hoch.",
    lipSyncLongerHint:
      "Lip Sync kann länger dauern als Bild-Generierung.",
    generateLipSync: "Lip Sync generieren",
    imageModeLipSyncActiveNote: "Lip Sync Studio · Beta · 30 Credits",
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
        label: "Standard Image",
        description:
          "Zuverlässige Kampagnenvisuals über den Produktions-Image-Workflow.",
      },
      ugcLook: {
        label: "UGC Look",
        description:
          "Authentische Smartphone-/Creator-Visuals für TikTok, Reels und Organic Ads.",
        hoverHint:
          "Ideal für lockere Creator-Posts, Produktempfehlungen und realistischen Social Content.",
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
      lipSync: {
        label: "Lip Sync Studio",
        description:
          "Erstelle sprechende Creator-Clips aus Skripten, Stimme und Visuals.",
        panel: {
          statusPlanned: "Demnächst · Geplant",
          statusActive: "Beta",
          introPlanned:
            "Lip Sync Studio ist geplant. Geschätzte 20–80 Credits je nach Dauer.",
          introActive:
            "Lade Quellmedien und Audio hoch. Dein Lip-Sync-Video erscheint im Agent und in der Galerie.",
          sourceLabel: "Quellmedien",
          sourcePlaceholder: "Bild oder Video hochladen",
          sourceHint: "Bild: PNG/JPEG/WebP · Video: MP4/WebM/MOV · max. 50 MB",
          uploadSource: "Quellmedien hochladen",
          audioLabel: "Audio",
          audioPlaceholder: "Audiospur hochladen",
          audioHint: "MP3, WAV, AAC, OGG, M4A · max. 25 MB",
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
          activeNote:
            "Lip Sync nutzt Quellmedien und Audio — kein Text-to-Speech.",
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
      live: "Live",
      beta: "Beta",
      oneCredit: "1 Credit",
      twoCredits: "2 Credits",
      threeCredits: "3 Credits",
      fourCredits: "4 Credits",
      fiveCredits: "5 Credits",
      twentyFiveCredits: "25 Credits",
      thirtyCredits: "30 Credits",
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
    lipSyncBadge: "Lip Sync",
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
      lipSync: "Lip Sync Studio: Geplant (20–80 Credits)",
    },
    lipSyncUsageNote:
      "Lip Sync nutzt Quellmedien und Audio als Eingabe.",
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
