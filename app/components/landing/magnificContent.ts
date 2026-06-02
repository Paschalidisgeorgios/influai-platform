import { TRUST_COMMERCIAL_FAQ } from "@/lib/copy/trust-commercial-faq";

export type LandingLanguage = "en" | "de";

export type LandingCreatorToolStatus =
  | "available"
  | "credit_gated"
  | "preview"
  | "request_access"
  | "pro"
  | "coming_soon";

export type LandingCreatorToolCard = {
  title: string;
  body: string;
  status: LandingCreatorToolStatus;
};

export const LANDING_LANGUAGE_KEY = "influexai-landing-lang";

export type HeroTrack = {
  title: string;
  sub: string;
  desc: string;
  typewriter: string;
  direction: "left" | "right" | "top" | "bottom";
};

export const magnificContent = {
  en: {
    nav: {
      features: "Features",
      models: "Models",
      pricing: "Pricing",
      signIn: "Login",
      openStudio: "Create Free Pack",
    },
    hero: {
      badge: "AI Creator Studio",
      headline: "From one idea to a ready-to-post Social Asset Pack.",
      subtitle:
        "InfluExAi turns rough ideas into complete content bundles — images, motion video, Creative Score, hooks, captions and export. In minutes, not hours.",
      trustLine:
        "1 idea → 3 image variations → motion video → score → hooks → export",
      body: "",
      cta: "Create your free Pack",
      secondaryCta: "See the workflow",
      studioMockup: {
        studioLabel: "Creator Studio",
        promptLabel: "Your idea",
        promptSample:
          "Premium skincare on marble, soft studio light",
        createImage: "Create Image",
        createVideo: "Create Motion Video",
        creditsBadge: "25 credits",
        canvasLabel: "Preview",
        canvasReady: "Ready",
      },
      workflowDemo: {
        packTitle: "Social Asset Pack",
        previewLabel: "Pack preview",
        disclaimer: "Demo only — illustrative outputs, not live generation",
        ideaLabel: "Your idea",
        inputSample: "Wireless earbuds hero shot on matte stone, soft side light",
        variationLabels: ["E-commerce", "Streetwear", "Beauty product"],
        outputs: {
          imageVariations: "3 Image Variations",
          motionClip: "1 Motion Clip",
          hooks: "5 Hooks",
          captions: "3 Captions",
          hashtags: "Hashtags",
          creativeScore: "Creative Score",
          exportPack: "Export Pack",
        },
        scoreValue: "84",
        scoreHint: "Strong hook & visual clarity",
        hashtagSample: "#ecommerce #productlaunch #socialcontent #reels #brand",
        motionClipHint: "5s motion clip · Reels-ready",
      },
      renderLabel: "Generating preview…",
      generateLabel: "Generate triggered",
      previewLabel: "Preview",
      resultLabel: "Preview ready",
      tracks: [
        {
          title: "1. Create Images",
          sub: "Generate high-quality visuals, product shots and social assets from simple ideas.",
          desc: "",
          typewriter:
            "wireless earbuds catalog hero on matte stone, soft side light, clean product focus --ar 4:5",
          direction: "left",
        },
        {
          title: "2. Create Motion Videos",
          sub: "Turn your idea into a short AI-generated motion video for reels, ads and social content.",
          desc: "",
          typewriter:
            "short food reel with overhead pour shot, warm kitchen light, social vertical --ar 9:16",
          direction: "right",
        },
        {
          title: "3. Prompt Assist",
          sub: "Start rough. InfluExAI improves your idea with clearer lighting, composition, motion and style.",
          desc: "",
          typewriter:
            "minimal sneaker product shot for Instagram, clean background, bold lighting --ar 1:1",
          direction: "top",
        },
        {
          title: "4. Creative Score & Gallery",
          sub: "Get practical feedback and save every asset in your Creator Gallery.",
          desc: "",
          typewriter:
            "fitness creator promo visual with bold lighting, energetic mood, social-ready --ar 4:5",
          direction: "bottom",
        },
      ] satisfies HeroTrack[],
    },
    intelligentPrompting: {
      headline: "Intelligent prompting, built into the workflow.",
      subtitle:
        "You can start with a rough idea. InfluExAI helps shape it into a production-ready prompt for images, motion videos and creator assets.",
      steps: [
        {
          key: "start",
          title: "Step 1 — Start rough",
          exampleLabel: "Example",
          body: "restaurant dish on table",
        },
        {
          key: "intent",
          title: "Step 2 — InfluExAI understands the intent",
          detectedLabel: "Detected",
          bullets: [
            "Food visual",
            "Social format",
            "Lighting missing",
            "Composition missing",
          ],
        },
        {
          key: "assist",
          title: "Step 3 — Prompt Assist improves the idea",
          enhancedLabel: "Enhanced",
          body: "Restaurant dish hero on a wooden table, natural window light, steam detail, appetizing color contrast, menu-ready social composition.",
        },
        {
          key: "teach",
          title: "Step 4 — The explanation teaches the user",
          messageLabel: "Message",
          body: "Window light, surface texture and plating were added to make the dish clearer and more appetizing on social.",
        },
      ],
      examplesHeadline: "Image and video prompts",
      examplesSubline:
        "The same flow applies whether you are creating a still or a motion clip.",
      imageExample: {
        badge: "Image",
        inputLabel: "Image input",
        input: "restaurant dish on table",
        improvedLabel: "Image improved",
        improved:
          "Restaurant dish hero on a wooden table, natural window light, steam detail, appetizing color contrast, menu-ready social composition.",
      },
      videoExample: {
        badge: "Video",
        inputLabel: "Video input",
        input: "street style outfit",
        improvedLabel: "Video improved",
        improved:
          "Short street-style creator video in an urban setting, handheld camera movement, confident walking motion, natural daylight, social reel format.",
      },
    },
    creatorWorkflow: {
      headline: "One idea through the full creator pipeline.",
      tagline:
        "Write, improve, generate, score, copy and export — a complete creator system, not a single generator.",
      steps: [
        "Write a simple idea",
        "Choose image or motion video",
        "Let Prompt Assist improve it",
        "Render with credits",
        "Score, refine, export or create another version",
      ],
    },
    builtFor: {
      headline: "Built for creators, brands and teams that need content fast.",
      cards: [
        {
          title: "Solo Creators",
          body: "Create images, motion clips, hooks and captions without starting from a blank page.",
        },
        {
          title: "UGC Creators",
          body: "Turn product ideas into visuals, short clips and social-ready copy.",
        },
        {
          title: "E-commerce Brands",
          body: "Generate catalog heroes, variants and format-ready assets for social channels.",
        },
        {
          title: "Real Estate Teams",
          body: "Listing visuals, interior highlights and format-ready assets for property marketing.",
        },
        {
          title: "Agencies",
          body: "Prepare repeatable creator workflows, asset packs and client-ready exports.",
        },
      ],
    },
    exampleWorkflows: {
      eyebrow: "Demo proof",
      headline: "Example workflows",
      tagline:
        "Illustrative demo projects only — not real customers, logos or usage stats.",
      demoProjectLabel: "Demo project",
      roughIdeaLabel: "Rough idea",
      assetTypesLabel: "Generated asset types",
      hooksCaptionsLabel: "Hooks & captions",
      hooksCaptionsIncluded: "Included",
      creativeScoreLabel: "Creative Score preview",
      projects: [
        {
          title: "Demo workflow: Beauty product launch",
          roughIdea: "Serum bottle flat lay on marble, soft morning light",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "4:5 & 9:16 export formats",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "86",
          scoreHint: "Clear product focus, strong hook angles",
        },
        {
          title: "Demo workflow: Fitness creator promo",
          roughIdea: "Protein shaker on gym bench, bold energy",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Hashtag suggestions",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "84",
          scoreHint: "High energy visuals, reel-ready pacing",
        },
        {
          title: "Demo workflow: Streetwear drop",
          roughIdea: "Urban outfit walk-by, handheld reel feel",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Caption-ready copy blocks",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "81",
          scoreHint: "Strong mood, tighten hook on variant 2",
        },
        {
          title: "Demo workflow: Food visual",
          roughIdea: "Signature pasta dish, steam and window light",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Menu-ready crops",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "83",
          scoreHint: "Appetizing color, strong overhead angle",
        },
        {
          title: "Demo workflow: E-commerce product",
          roughIdea: "Earbuds hero on matte stone, catalog clean",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Square & vertical exports",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "85",
          scoreHint: "Sharp product focus, ad-ready framing",
        },
        {
          title: "Demo workflow: Automotive teaser",
          roughIdea: "Sedan golden-hour pan, dealership social",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "9:16 reel format",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "80",
          scoreHint: "Dynamic angle, add tighter hook",
        },
        {
          title: "Demo workflow: Real estate listing",
          roughIdea: "Bright living room wide shot, natural daylight",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Story & feed formats",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "82",
          scoreHint: "Spacious feel, clear room flow",
        },
        {
          title: "Demo workflow: UGC creator review",
          roughIdea: "Creator unboxing everyday tech gadget, authentic tone",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Hook-first caption blocks",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "79",
          scoreHint: "Authentic framing, strengthen opening hook",
        },
        {
          title: "Demo workflow: SaaS / B2B social",
          roughIdea: "Dashboard on laptop, clean desk, LinkedIn crop",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "1:1 & 4:5 exports",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "87",
          scoreHint: "Clear UI focus, professional tone",
        },
        {
          title: "Demo workflow: Agency client pack",
          roughIdea: "DTC launch pack with on-brand colors and multi-format exports",
          assetTypes: [
            "3 image variations",
            "1 motion clip (5s)",
            "Client-ready export manifest",
          ],
          hooksCaptions: "5 hooks · 3 captions",
          creativeScore: "88",
          scoreHint: "Cohesive pack, strong cross-format consistency",
        },
      ],
    },
    createImage: {
      eyebrow: "Create Image",
      headline: "Create polished images from simple ideas.",
      body: "Generate creator visuals, product shots and social assets with modes for fast drafts, premium visuals and realtime exploration.",
      modes: [
        {
          id: "auto_image",
          title: "Auto",
          body: "Let InfluExAI choose the best image mode.",
        },
        {
          id: "fast_draft_image",
          title: "Fast Draft",
          body: "Quick drafts for testing ideas.",
        },
        {
          id: "premium_image",
          title: "Premium Image",
          body: "More polished visuals with stronger detail for final assets.",
        },
        {
          id: "realtime_image",
          title: "Realtime Render",
          body: "Explore visual directions quickly.",
        },
      ],
      availableLabel: "Available in studio",
    },
    createMotionVideo: {
      eyebrow: "Create Motion Video",
      headline: "Create motion videos from text.",
      body: "Turn an idea into a short AI-generated motion video for reels, ads and social content.",
      presetsLabel: "Motion direction examples",
      presets: [
        "Street-style handheld",
        "Slow cinematic zoom",
        "Product rotation",
        "Luxury ad motion",
        "TikTok hook shot",
      ],
      creditLabel: "Motion Video — 25 Credits",
      availabilityNote:
        "Text-to-video is available in the studio today. Other motion tools such as image-to-video are coming soon.",
    },
    modelsQuality: {
      eyebrow: "Models & Quality",
      previewBadge: "Preview",
      headline: "Choose the result — not the raw model.",
      body: "InfluExAI keeps the technical model layer behind the scenes. You choose what you want to create, the quality level and the workflow.",
      footnote:
        "Advanced tools are listed for planning — only active workflows run in the studio today.",
      drawerTitle: "Models & Quality",
      activeLabel: "Active",
      comingSoonLabel: "Coming soon",
      groups: [
        {
          id: "image",
          label: "Image",
          items: [
            { label: "Auto", status: "active" },
            { label: "Fast Draft", status: "active" },
            { label: "Premium Image", status: "active" },
            { label: "Realtime Render", status: "active" },
          ],
        },
        {
          id: "video",
          label: "Video",
          items: [
            { label: "Auto Video", status: "active" },
            { label: "Cinematic Video", status: "active" },
          ],
        },
        {
          id: "reference_edit",
          label: "Reference & Edit",
          items: [
            { label: "Use Reference Image", status: "coming_soon" },
            { label: "Edit Image", status: "coming_soon" },
            { label: "Match Style", status: "coming_soon" },
          ],
        },
        {
          id: "training",
          label: "Training",
          items: [
            { label: "Train Creator Style", status: "coming_soon" },
            { label: "Train Brand Kit", status: "coming_soon" },
            { label: "Train Product Model", status: "coming_soon" },
          ],
        },
        {
          id: "enhance",
          label: "Enhance",
          items: [
            { label: "Enhance Asset", status: "coming_soon" },
            { label: "Background Remove", status: "coming_soon" },
          ],
        },
        {
          id: "avatar_lipsync",
          label: "Avatar & LipSync",
          items: [
            { label: "LipSync Creator", status: "coming_soon" },
            { label: "AI Avatar", status: "coming_soon" },
          ],
        },
        {
          id: "three_d",
          label: "3D",
          items: [{ label: "3D Object", status: "coming_soon" }],
        },
      ],
    },
    advancedCreatorTools: {
      headline: "Built to grow into a full creator system.",
      body: "InfluExAI is designed for more than one-off generations. Advanced creator tools are being prepared for consistent styles, reusable brand assets and more powerful content workflows.",
      comingSoonLabel: "Coming soon",
      advancedToolLabel: "Advanced tool",
      cards: [
        { title: "Use Reference Image" },
        { title: "Edit Image" },
        { title: "Match Style" },
        { title: "Train Creator Style" },
        { title: "Train Brand Kit" },
        { title: "Train Product Model" },
        { title: "Animate Image" },
        { title: "LipSync Creator" },
        { title: "AI Avatar" },
        { title: "Enhance Asset" },
        { title: "3D Object" },
      ],
    },
    creativeScore: {
      headline: "Know what works before you post.",
      body: "Creative Score gives practical feedback on clarity, composition, hooks and social readiness.",
      scoreLabel: "Creative Score",
      scoreValue: "82",
      scoreMax: "100",
      worksTitle: "What works",
      improveTitle: "What to improve",
      works: [
        "Strong subject focus",
        "Clean contrast for social feeds",
        "Clear visual hierarchy",
      ],
      improve: [
        "Add a stronger hook",
        "Make the background less distracting",
      ],
      socialTitle: "Social copy suggestions",
      hooksLabel: "Hooks",
      captionsLabel: "Captions",
      hashtagsLabel: "Hashtags",
      copyHookLabel: "Copy Hook",
      copyCaptionLabel: "Copy Caption",
      copyHashtagsLabel: "Copy Hashtags",
      sampleHook: "This product shot stops the scroll — clean light, one clear hero.",
      sampleCaption:
        "Catalog-ready product visual, shot for social. Save this layout for your next launch.",
      sampleHashtags: "#ecommerce #productphotography #creatortools #socialready",
      disclaimer: "Example feedback for illustration — scores and suggestions vary by asset.",
    },
    creatorGallery: {
      headline: "Everything you create stays organized.",
      body: "Save, preview and reuse your generated images and motion videos in your Creator Gallery.",
      demoDisclaimer:
        "Demo examples below — illustrative prompts only, not real client work.",
      demoLabel: "Demo example",
      cards: [
        {
          id: "ecommerce_product",
          category: "E-commerce product",
          type: "image",
          promptSnippet: "Wireless earbuds catalog hero on matte stone, soft side light…",
          studioLabel: "Created with Image Studio",
        },
        {
          id: "streetwear_drop",
          category: "Streetwear drop",
          type: "image",
          promptSnippet: "Urban streetwear outfit, bold typography space, hype drop mood…",
          studioLabel: "Created with Image Studio",
        },
        {
          id: "food_visual",
          category: "Food visual",
          type: "image",
          promptSnippet: "Restaurant dish hero with window light and steam detail…",
          studioLabel: "Created with Image Studio",
        },
        {
          id: "fitness_creator",
          category: "Fitness creator",
          type: "video",
          promptSnippet: "Fitness creator promo clip, bold gym lighting, reel pacing…",
          studioLabel: "Created with Video Studio",
        },
        {
          id: "automotive",
          category: "Automotive",
          type: "video",
          promptSnippet: "Automotive teaser, golden-hour pan across sedan…",
          studioLabel: "Created with Video Studio",
        },
        {
          id: "saas_b2b",
          category: "SaaS / B2B",
          type: "image",
          promptSnippet: "SaaS dashboard on laptop, clean desk, LinkedIn-ready crop…",
          studioLabel: "Created with Image Studio",
        },
      ],
    },
    landingCredits: {
      headline: "Clear credits. No surprise costs.",
      body: "Credits are used for image generation, video rendering and premium creator tools. You always see the estimated cost before creating.",
      footnote: "Free guidance helps you plan. Credits power rendering and generation.",
      mockup: {
        yourCredits: "Your Credits",
        availableLabel: "Available Credits",
        availableValue: "122",
        usageImages: "Images",
        usageVideos: "Motion Videos",
        usagePremium: "Premium Tools",
        packs: [
          { name: "Starter", credits: "100 Credits", popular: false },
          { name: "Creator", credits: "500 Credits", popular: true, popularLabel: "Most Popular" },
          { name: "Pro", credits: "2000 Credits", popular: false },
        ],
      },
    },
    zoom: {
      headline: "Enhancer preview",
      body: "Advanced enhancement tools are not part of the MVP launch.",
    },
    video: {
      lipsync: {
        title: "Lip-Sync Preview",
        desc: "Coming later",
        pill: "Not in MVP",
      },
      motion: {
        title: "Motion Transfer Preview",
        desc: "Coming later",
        pill: "Not in MVP",
      },
    },
    creditValue: {
      headline: "Simple credit-based creation.",
      subline:
        "Credits are used for generation and rendering. You always see the estimated credit cost before generating.",
      billingLines: [
        "Credits are used for generation and rendering.",
        "You always see the estimated credit cost before generating.",
        "Buy credits or upgrade when you need more.",
      ],
      conversion: "Credits do not expire. Start small and add more when your output grows.",
      tiers: [
        {
          key: "starter" as const,
          title: "Try the studio",
          body: "Create your first images and videos, test prompts and build your gallery.",
        },
        {
          key: "professional" as const,
          title: "Regular creators",
          body: "More credits for steady content production and social-ready assets.",
        },
        {
          key: "ultimate" as const,
          title: "High output",
          body: "More capacity when you publish frequently or run multiple formats.",
        },
      ],
    },
    campaignFeatures: {
      headline: "Everything a creator needs in one workflow.",
      subheadline:
        "Available tools run in the studio today. Preview, request-access and Pro workflows are open for planning — paid rendering unlocks when each module clears.",
      statusLabels: {
        available: "Available",
        credit_gated: "Credits required",
        preview: "Preview",
        request_access: "Request access",
        pro: "Pro workflow",
        coming_soon: "Coming soon",
      },
      cards: [
        {
          title: "Create Image",
          body: "Generate creator visuals, product shots and social assets from a simple idea.",
          status: "available",
        },
        {
          title: "Create Motion Video",
          body: "Turn text into short motion clips for Reels, TikTok and paid social. 25 Credits per render.",
          status: "credit_gated",
        },
        {
          title: "Social Asset Pack",
          body: "Preview your pack plan for free. Full render uses 45 Credits — cost shown before you generate.",
          status: "credit_gated",
        },
        {
          title: "Use Reference Image",
          body: "Plan reference-guided visuals. Preview the workflow; rendering unlocks after validation.",
          status: "preview",
        },
        {
          title: "Edit Image",
          body: "Plan precise edits to lighting, background and composition. Preview only for now.",
          status: "preview",
        },
        {
          title: "Match Style",
          body: "Plan style matching from a reference look. Preview only for now.",
          status: "preview",
        },
        {
          title: "Animate Image",
          body: "Turn a still into motion. Request access for early entry — not generally available yet.",
          status: "request_access",
        },
        {
          title: "LipSync Creator",
          body: "Talking-head creator videos. Pro workflow — upgrade or request access to plan ahead.",
          status: "pro",
        },
        {
          title: "AI Avatar",
          body: "Avatar-style creator videos. Pro workflow — upgrade or request access to plan ahead.",
          status: "pro",
        },
        {
          title: "Train Creator Style",
          body: "Reusable visual style from your assets. Pro training workflow — preview and request access.",
          status: "pro",
        },
        {
          title: "Train Brand Kit",
          body: "Consistent brand visuals across campaigns. Pro training workflow — preview and request access.",
          status: "pro",
        },
        {
          title: "Train Product Model",
          body: "Reusable product look for e-commerce and ads. Pro training workflow — preview and request access.",
          status: "pro",
        },
        {
          title: "Enhance Asset",
          body: "Upscale and clean assets for export. Preview the workflow; rendering unlocks after validation.",
          status: "preview",
        },
        {
          title: "3D Object",
          body: "3D-style product visuals for ads and social. Pro workflow — request access to plan ahead.",
          status: "pro",
        },
        {
          title: "Creative Score",
          body: "Free feedback on hook clarity, composition and social readiness — no credits required.",
          status: "available",
        },
        {
          title: "Export Pack",
          body: "Free export manifest for TikTok, Reels, Story and Feed — no surprise charges for planning.",
          status: "available",
        },
      ] satisfies LandingCreatorToolCard[],
    },
    comparison: {
      headline: "Before & after",
      subtitle: "Compare a draft concept with a refined studio output.",
      beforeLabel: "Draft",
      afterLabel: "Studio output",
      body: "Prompt Assist and Creative Score help you refine ideas before you spend credits on generation.",
    },
    marquee:
      "InfluExAI · AI Creator Studio · Images · Motion · Packs · Score · Export · Gallery · ",
    pricing: {
      headline: "Credit packages",
      subheadline:
        "One-time credit packs. Generation and rendering use credits — costs are shown before you generate.",
      oneTime: "once",
      plans: {
        starter: {
          tagline:
            "Good for testing ideas and creating first assets.",
          buyLabel: "Buy Starter",
          badge: "",
        },
        professional: {
          badge: "Most Popular",
          tagline:
            "Best for regular content creation, variants and video workflows.",
          buyLabel: "Buy Creator",
        },
        ultimate: {
          tagline:
            "For frequent creators, premium rendering and larger workflows.",
          buyLabel: "Buy Pro",
          badge: "",
        },
      },
    },
    trust: {
      metrics: [
        { value: "Images", title: "High-quality creator visuals" },
        { value: "Video", title: "Short AI social clips" },
        { value: "Gallery", title: "Built-in asset library" },
      ],
      rightsPanel: TRUST_COMMERCIAL_FAQ.en,
      faqTitle: "FAQ",
      faq: [
        {
          q: "What can I create today?",
          a: "Create Image, Create Motion Video, Social Asset Pack (free preview; render uses credits), Creative Score, Hooks & Captions and Export Pack are available now. Reference, edit, enhance, animate and training tools open as Preview, Request access or Pro workflow — they do not render until cleared.",
        },
        {
          q: "How do credits work?",
          a: "Credits pay for generation and rendering. You see the estimated cost before each run. Buy credit packs when you need more — no subscription required.",
        },
        {
          q: "What do credit packs cost?",
          a: "Starter: 100 credits for €9. Creator: 500 credits for €29 (Most Popular). Pro: 2000 credits for €79. Larger packs offer better value per credit. Custom top-ups from 100 credits at €0.10 per credit.",
        },
        {
          q: "Is this a subscription?",
          a: "No. One-time credit packs. Your balance does not expire.",
        },
        {
          q: "Where are my assets stored?",
          a: "Completed generations appear in your Creator Gallery, tied to your authenticated account.",
        },
      ],
    },
    finalCta: {
      headline: "Ready to create your first asset?",
      cta: "Start creating",
    },
    checkout: {
      loading: "Opening secure checkout…",
      error: "Checkout failed. Sign in and try again.",
    },
  },
  de: {
    nav: {
      features: "Funktionen",
      models: "Modelle",
      pricing: "Preise",
      signIn: "Login",
      openStudio: "Kostenloses Pack erstellen",
    },
    hero: {
      badge: "AI Creator Studio",
      headline: "Von einer Idee zum fertigen Social Asset Pack.",
      subtitle:
        "InfluExAi verwandelt Ideen in komplette Content-Pakete — Bilder, Motion Video, Creative Score, Hooks, Captions und Export. In Minuten, nicht Stunden.",
      trustLine:
        "1 Idee → 3 Bildvarianten → Motion Video → Score → Hooks → Export",
      body: "",
      cta: "Kostenloses Pack erstellen",
      secondaryCta: "Workflow ansehen",
      studioMockup: {
        studioLabel: "Creator Studio",
        promptLabel: "Deine Idee",
        promptSample:
          "Premium-Skincare auf Marmor, weiches Studiolicht",
        createImage: "Bild erstellen",
        createVideo: "Motion-Video erstellen",
        creditsBadge: "25 Credits",
        canvasLabel: "Vorschau",
        canvasReady: "Bereit",
      },
      workflowDemo: {
        packTitle: "Social Asset Pack",
        previewLabel: "Pack-Vorschau",
        disclaimer: "Nur Demo — illustrative Beispiele, keine Live-Generierung",
        ideaLabel: "Deine Idee",
        inputSample: "Wireless Earbuds Hero auf mattem Stein, weiches Seitenlicht",
        variationLabels: ["E-Commerce", "Streetwear", "Beauty-Produkt"],
        outputs: {
          imageVariations: "3 Bild-Varianten",
          motionClip: "1 Motion-Clip",
          hooks: "5 Hooks",
          captions: "3 Captions",
          hashtags: "Hashtags",
          creativeScore: "Creative Score",
          exportPack: "Export-Paket",
        },
        scoreValue: "84",
        scoreHint: "Starke Hook- & Bild-Klarheit",
        hashtagSample: "#ecommerce #productlaunch #socialcontent #reels #brand",
        motionClipHint: "5s Motion-Clip · Reels-ready",
      },
      renderLabel: "Vorschau wird generiert…",
      generateLabel: "Generierung gestartet",
      previewLabel: "Vorschau",
      resultLabel: "Vorschau bereit",
      tracks: [
        {
          title: "1. Bilder erstellen",
          sub: "Erzeuge hochwertige Visuals, Produktshots und Social Assets aus einfachen Ideen.",
          desc: "",
          typewriter:
            "Wireless Earbuds Katalog-Hero auf mattem Stein, weiches Seitenlicht, scharfer Produktfokus --ar 4:5",
          direction: "left",
        },
        {
          title: "2. Motion-Videos erstellen",
          sub: "Verwandle deine Idee in ein kurzes KI-Motion-Video für Reels, Ads und Social Content.",
          desc: "",
          typewriter:
            "kurzes Food-Reel mit Overhead-Pour-Shot, warmes Küchenlicht, Social Vertical --ar 9:16",
          direction: "right",
        },
        {
          title: "3. Prompt Assist",
          sub: "Starte grob — InfluExAI verbessert Licht, Komposition, Bewegung und Stil.",
          desc: "",
          typewriter:
            "minimaler Sneaker-Produktshot für Instagram, cleaner Hintergrund, bold lighting --ar 1:1",
          direction: "top",
        },
        {
          title: "4. Creative Score & Galerie",
          sub: "Praktisches Feedback erhalten und jedes Asset in deiner Creator Gallery speichern.",
          desc: "",
          typewriter:
            "Fitness-Creator-Promo mit bold lighting, energiegeladene Stimmung, social-ready --ar 4:5",
          direction: "bottom",
        },
      ] satisfies HeroTrack[],
    },
    intelligentPrompting: {
      headline: "Intelligentes Prompting — fest im Workflow verankert.",
      subtitle:
        "Du kannst mit einer groben Idee starten. InfluExAI formt sie zu einem produktionsreifen Prompt für Bilder, Motion-Videos und Creator-Assets.",
      steps: [
        {
          key: "start",
          title: "Schritt 1 — Grob starten",
          exampleLabel: "Beispiel",
          body: "Restaurant-Gericht auf Tisch",
        },
        {
          key: "intent",
          title: "Schritt 2 — InfluExAI versteht die Absicht",
          detectedLabel: "Erkannt",
          bullets: [
            "Food-Visual",
            "Social-Format",
            "Licht fehlt",
            "Komposition fehlt",
          ],
        },
        {
          key: "assist",
          title: "Schritt 3 — Prompt Assist verbessert die Idee",
          enhancedLabel: "Verbessert",
          body: "Restaurant-Gericht Hero auf Holztisch, natürliches Fensterlicht, Dampf-Detail, appetitlicher Farbkontrast, menü-taugliche Social-Komposition.",
        },
        {
          key: "teach",
          title: "Schritt 4 — Die Erklärung hilft beim Lernen",
          messageLabel: "Hinweis",
          body: "Fensterlicht, Oberfläche und Anrichtung wurden ergänzt, damit das Gericht auf Social klarer und appetitlicher wirkt.",
        },
      ],
      examplesHeadline: "Bild- und Video-Prompts",
      examplesSubline:
        "Derselbe Ablauf gilt für Stills und Motion-Clips.",
      imageExample: {
        badge: "Bild",
        inputLabel: "Bild-Input",
        input: "Restaurant-Gericht auf Tisch",
        improvedLabel: "Bild verbessert",
        improved:
          "Restaurant-Gericht Hero auf Holztisch, natürliches Fensterlicht, Dampf-Detail, appetitlicher Farbkontrast, menü-taugliche Social-Komposition.",
      },
      videoExample: {
        badge: "Video",
        inputLabel: "Video-Input",
        input: "Street-Style-Outfit",
        improvedLabel: "Video verbessert",
        improved:
          "Kurzes Street-Style-Creator-Video in urbaner Umgebung, Handkamera-Bewegung, selbstbewusster Gang, Tageslicht, Social-Reel-Format.",
      },
    },
    creatorWorkflow: {
      headline: "Eine Idee durch die komplette Creator-Pipeline.",
      tagline:
        "Schreiben, verbessern, generieren, scoren, kopieren und exportieren — ein vollständiges Creator-System, kein Einzelgenerator.",
      steps: [
        "Schreibe eine einfache Idee",
        "Wähle Bild oder Motion-Video",
        "Lass Prompt Assist die Idee verbessern",
        "Rendere mit Credits",
        "Score, verfeinere, exportiere oder erstelle eine weitere Version",
      ],
    },
    builtFor: {
      headline:
        "Gebaut für Creator, Brands und Teams, die schnell Content brauchen.",
      cards: [
        {
          title: "Solo Creator",
          body: "Erstelle Bilder, Motion-Clips, Hooks und Captions — ohne bei null anzufangen.",
        },
        {
          title: "UGC Creator",
          body: "Verwandle Produktideen in Visuals, kurze Clips und social-ready Copy.",
        },
        {
          title: "E-Commerce Brands",
          body: "Generiere Katalog-Heros, Varianten und format-fertige Assets für Social Channels.",
        },
        {
          title: "Immobilien-Teams",
          body: "Listing-Visuals, Interior-Highlights und format-fertige Assets für Immobilien-Marketing.",
        },
        {
          title: "Agenturen",
          body: "Bereite wiederholbare Creator-Workflows, Asset-Packs und export-fertige Deliverables für Kunden vor.",
        },
      ],
    },
    exampleWorkflows: {
      eyebrow: "Demo-Nachweis",
      headline: "Beispiel-Workflows",
      tagline:
        "Nur illustrative Demo-Projekte — keine echten Kunden, Logos oder Nutzungszahlen.",
      demoProjectLabel: "Demo-Projekt",
      roughIdeaLabel: "Rohe Idee",
      assetTypesLabel: "Generierte Asset-Typen",
      hooksCaptionsLabel: "Hooks & Captions",
      hooksCaptionsIncluded: "Enthalten",
      creativeScoreLabel: "Creative-Score-Vorschau",
      projects: [
        {
          title: "Demo-Workflow: Beauty-Produktlaunch",
          roughIdea: "Serum-Flasche Flat Lay auf Marmor, weiches Morgenlicht",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "4:5 & 9:16 Export-Formate",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "86",
          scoreHint: "Klares Produktfokus, starke Hook-Ansätze",
        },
        {
          title: "Demo-Workflow: Fitness-Creator-Promo",
          roughIdea: "Protein-Shaker auf Gym-Bank, bold Energy",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Hashtag-Vorschläge",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "84",
          scoreHint: "Energiegeladene Visuals, reel-ready Pacing",
        },
        {
          title: "Demo-Workflow: Streetwear-Drop",
          roughIdea: "Urban Outfit Walk-by, Handheld-Reel-Feel",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Caption-ready Copy-Blöcke",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "81",
          scoreHint: "Starke Stimmung, Hook bei Variante 2 schärfen",
        },
        {
          title: "Demo-Workflow: Food-Visual",
          roughIdea: "Signature-Pasta-Gericht, Dampf und Fensterlicht",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Menü-taugliche Crops",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "83",
          scoreHint: "Appetitliche Farben, starker Overhead-Winkel",
        },
        {
          title: "Demo-Workflow: E-Commerce-Produkt",
          roughIdea: "Earbuds Hero auf mattem Stein, catalog clean",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Quadrat- & Vertical-Exports",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "85",
          scoreHint: "Scharfer Produktfokus, ad-ready Framing",
        },
        {
          title: "Demo-Workflow: Automotive-Teaser",
          roughIdea: "Limousine Golden-Hour-Pan, Dealership-Social",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "9:16 Reel-Format",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "80",
          scoreHint: "Dynamischer Winkel, Hook schärfen",
        },
        {
          title: "Demo-Workflow: Immobilien-Listing",
          roughIdea: "Helles Wohnzimmer Weitwinkel, Tageslicht",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Story- & Feed-Formate",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "82",
          scoreHint: "Großzügige Wirkung, klare Raumführung",
        },
        {
          title: "Demo-Workflow: UGC-Creator-Review",
          roughIdea: "Creator packt Tech-Gadget aus, authentischer Ton",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Hook-first Caption-Blöcke",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "79",
          scoreHint: "Authentisches Framing, Opening-Hook stärken",
        },
        {
          title: "Demo-Workflow: SaaS / B2B Social",
          roughIdea: "Dashboard auf Laptop, cleanes Desk, LinkedIn-Crop",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "1:1 & 4:5 Exports",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "87",
          scoreHint: "Klarer UI-Fokus, professioneller Ton",
        },
        {
          title: "Demo-Workflow: Agentur-Kunden-Pack",
          roughIdea: "DTC-Launch-Pack mit Markenfarben und Multi-Format-Exports",
          assetTypes: [
            "3 Bild-Varianten",
            "1 Motion-Clip (5s)",
            "Kunden-fertiges Export-Manifest",
          ],
          hooksCaptions: "5 Hooks · 3 Captions",
          creativeScore: "88",
          scoreHint: "Kohärentes Pack, starke Format-Konsistenz",
        },
      ],
    },
    createImage: {
      eyebrow: "Bild erstellen",
      headline: "Polierte Bilder aus einfachen Ideen.",
      body: "Erzeuge Creator-Visuals, Produktshots und Social Assets — mit Modi für schnelle Entwürfe, Premium-Visuals und schnelle Exploration.",
      modes: [
        {
          id: "auto_image",
          title: "Auto",
          body: "InfluExAI wählt den passenden Bildmodus.",
        },
        {
          id: "fast_draft_image",
          title: "Fast Draft",
          body: "Schnelle Entwürfe zum Testen von Ideen.",
        },
        {
          id: "premium_image",
          title: "Premium Image",
          body: "Poliertere Visuals mit stärkeren Details für finale Assets.",
        },
        {
          id: "realtime_image",
          title: "Realtime Render",
          body: "Visuelle Richtungen schnell erkunden.",
        },
      ],
      availableLabel: "Im Studio verfügbar",
    },
    createMotionVideo: {
      eyebrow: "Motion-Video erstellen",
      headline: "Motion-Videos aus Text erstellen.",
      body: "Verwandle eine Idee in ein kurzes KI-Motion-Video für Reels, Ads und Social Content.",
      presetsLabel: "Beispiele für Bewegungsrichtungen",
      presets: [
        "Street-Style Handkamera",
        "Langsamer cinematic Zoom",
        "Produktrotation",
        "Luxury-Ad-Motion",
        "TikTok-Hook-Shot",
      ],
      creditLabel: "Motion Video — 25 Credits",
      availabilityNote:
        "Text-to-Video ist heute im Studio verfügbar. Weitere Motion-Tools wie Image-to-Video kommen demnächst.",
    },
    modelsQuality: {
      eyebrow: "Modelle & Qualität",
      previewBadge: "Vorschau",
      headline: "Wähle das Ergebnis — nicht das Rohmodell.",
      body: "InfluExAI hält die technische Modell-Ebene im Hintergrund. Du wählst, was du erstellen willst, das Qualitätsniveau und den Workflow.",
      footnote:
        "Erweiterte Tools sind zur Planung sichtbar — im Studio laufen heute nur aktive Workflows.",
      drawerTitle: "Modelle & Qualität",
      activeLabel: "Aktiv",
      comingSoonLabel: "Demnächst",
      groups: [
        {
          id: "image",
          label: "Bild",
          items: [
            { label: "Auto", status: "active" },
            { label: "Fast Draft", status: "active" },
            { label: "Premium Image", status: "active" },
            { label: "Realtime Render", status: "active" },
          ],
        },
        {
          id: "video",
          label: "Video",
          items: [
            { label: "Auto Video", status: "active" },
            { label: "Cinematic Video", status: "active" },
          ],
        },
        {
          id: "reference_edit",
          label: "Referenz & Bearbeiten",
          items: [
            { label: "Referenzbild nutzen", status: "coming_soon" },
            { label: "Bild bearbeiten", status: "coming_soon" },
            { label: "Stil anpassen", status: "coming_soon" },
          ],
        },
        {
          id: "training",
          label: "Training",
          items: [
            { label: "Creator-Stil trainieren", status: "coming_soon" },
            { label: "Brand Kit trainieren", status: "coming_soon" },
            { label: "Produktmodell trainieren", status: "coming_soon" },
          ],
        },
        {
          id: "enhance",
          label: "Enhancer",
          items: [
            { label: "Asset verbessern", status: "coming_soon" },
            { label: "Hintergrund entfernen", status: "coming_soon" },
          ],
        },
        {
          id: "avatar_lipsync",
          label: "Avatar & LipSync",
          items: [
            { label: "LipSync Creator", status: "coming_soon" },
            { label: "AI Avatar", status: "coming_soon" },
          ],
        },
        {
          id: "three_d",
          label: "3D",
          items: [{ label: "3D Object", status: "coming_soon" }],
        },
      ],
    },
    advancedCreatorTools: {
      headline: "Wächst zu einem vollständigen Creator-System.",
      body: "InfluExAI ist für mehr als Einzelgenerierungen gebaut. Erweiterte Creator-Tools werden für konsistente Styles, wiederverwendbare Brand-Assets und stärkere Content-Workflows vorbereitet.",
      comingSoonLabel: "Demnächst",
      advancedToolLabel: "Erweitertes Tool",
      cards: [
        { title: "Referenzbild nutzen" },
        { title: "Bild bearbeiten" },
        { title: "Stil anpassen" },
        { title: "Creator-Stil trainieren" },
        { title: "Brand Kit trainieren" },
        { title: "Produktmodell trainieren" },
        { title: "Bild animieren" },
        { title: "LipSync Creator" },
        { title: "AI Avatar" },
        { title: "Asset verbessern" },
        { title: "3D Object" },
      ],
    },
    creativeScore: {
      headline: "Wisse, was funktioniert — bevor du postest.",
      body: "Creative Score liefert praktisches Feedback zu Klarheit, Komposition, Hooks und Social-Tauglichkeit.",
      scoreLabel: "Creative Score",
      scoreValue: "82",
      scoreMax: "100",
      worksTitle: "Was funktioniert",
      improveTitle: "Was verbessert werden kann",
      works: [
        "Starker Motivfokus",
        "Sauberer Kontrast für Social Feeds",
        "Klare visuelle Hierarchie",
      ],
      improve: [
        "Stärkeren Hook ergänzen",
        "Hintergrund weniger ablenkend gestalten",
      ],
      socialTitle: "Social-Copy-Vorschläge",
      hooksLabel: "Hooks",
      captionsLabel: "Captions",
      hashtagsLabel: "Hashtags",
      copyHookLabel: "Hook kopieren",
      copyCaptionLabel: "Caption kopieren",
      copyHashtagsLabel: "Hashtags kopieren",
      sampleHook:
        "Dieser Produktshot stoppt den Scroll — klares Licht, ein klarer Hero.",
      sampleCaption:
        "Katalog-taugliches Produktvisual, für Social gedreht. Layout für deinen nächsten Launch speichern.",
      sampleHashtags: "#ecommerce #productphotography #creatortools #socialready",
      disclaimer:
        "Beispiel-Feedback zur Illustration — Scores und Vorschläge variieren je Asset.",
    },
    creatorGallery: {
      headline: "Alles, was du erstellst, bleibt organisiert.",
      body: "Speichere, previewe und nutze deine generierten Bilder und Motion-Videos in deiner Creator Gallery.",
      demoDisclaimer:
        "Demo-Beispiele unten — illustrative Prompts, kein echtes Kundenprojekt.",
      demoLabel: "Demo-Beispiel",
      cards: [
        {
          id: "ecommerce_product",
          category: "E-Commerce-Produkt",
          type: "image",
          promptSnippet: "Wireless Earbuds Katalog-Hero auf mattem Stein, weiches Seitenlicht…",
          studioLabel: "Erstellt mit Image Studio",
        },
        {
          id: "streetwear_drop",
          category: "Streetwear-Drop",
          type: "image",
          promptSnippet: "Urban Streetwear Outfit, Platz für bold Typografie, Hype-Drop-Mood…",
          studioLabel: "Erstellt mit Image Studio",
        },
        {
          id: "food_visual",
          category: "Food-Visual",
          type: "image",
          promptSnippet: "Restaurant-Gericht Hero mit Fensterlicht und Dampf-Detail…",
          studioLabel: "Erstellt mit Image Studio",
        },
        {
          id: "fitness_creator",
          category: "Fitness-Creator",
          type: "video",
          promptSnippet: "Fitness-Creator-Promo-Clip, bold Gym-Licht, Reel-Pacing…",
          studioLabel: "Erstellt mit Video Studio",
        },
        {
          id: "automotive",
          category: "Automotive",
          type: "video",
          promptSnippet: "Automotive-Teaser, Golden-Hour-Pan über Limousine…",
          studioLabel: "Erstellt mit Video Studio",
        },
        {
          id: "saas_b2b",
          category: "SaaS / B2B",
          type: "image",
          promptSnippet: "SaaS-Dashboard auf Laptop, cleanes Desk, LinkedIn-ready Crop…",
          studioLabel: "Erstellt mit Image Studio",
        },
      ],
    },
    landingCredits: {
      headline: "Klare Credits. Keine Überraschungskosten.",
      body: "Credits werden für Bildgenerierung, Video-Rendering und Premium-Creator-Tools verwendet. Du siehst die geschätzten Kosten immer vor dem Erstellen.",
      footnote:
        "Kostenlose Guidance hilft beim Planen. Credits treiben Rendering und Generierung.",
      mockup: {
        yourCredits: "Deine Credits",
        availableLabel: "Verfügbare Credits",
        availableValue: "122",
        usageImages: "Bilder",
        usageVideos: "Motion-Videos",
        usagePremium: "Premium-Tools",
        packs: [
          { name: "Starter", credits: "100 Credits", popular: false },
          {
            name: "Creator",
            credits: "500 Credits",
            popular: true,
            popularLabel: "Am beliebtesten",
          },
          { name: "Pro", credits: "2000 Credits", popular: false },
        ],
      },
    },
    zoom: {
      headline: "Enhancer-Vorschau",
      body: "Erweiterte Enhancement-Tools sind nicht Teil des MVP-Launches.",
    },
    video: {
      lipsync: {
        title: "Lip-Sync Preview",
        desc: "Später verfügbar",
        pill: "Nicht im MVP",
      },
      motion: {
        title: "Motion Transfer Preview",
        desc: "Später verfügbar",
        pill: "Nicht im MVP",
      },
    },
    creditValue: {
      headline: "Einfache Credit-basierte Erstellung.",
      subline:
        "Credits werden für Generierung und Rendering verwendet. Du siehst die geschätzten Kosten immer vor dem Generieren.",
      billingLines: [
        "Credits werden für Generierung und Rendering verwendet.",
        "Du siehst die geschätzten Kosten immer vor dem Generieren.",
        "Kaufe Credits oder upgrade, wenn du mehr brauchst.",
      ],
      conversion:
        "Credits verfallen nicht. Starte klein und lade auf, wenn dein Output wächst.",
      tiers: [
        {
          key: "starter" as const,
          title: "Studio testen",
          body: "Erstelle deine ersten Bilder und Videos, teste Prompts und baue deine Galerie auf.",
        },
        {
          key: "professional" as const,
          title: "Regelmäßige Creator",
          body: "Mehr Credits für kontinuierliche Content-Produktion und social-ready Assets.",
        },
        {
          key: "ultimate" as const,
          title: "Hoher Output",
          body: "Mehr Kapazität, wenn du häufig publishst oder mehrere Formate fährst.",
        },
      ],
    },
    campaignFeatures: {
      headline: "Alles, was ein Creator in einem Workflow braucht.",
      subheadline:
        "Verfügbare Tools laufen heute im Studio. Vorschau-, Zugang-anfragen- und Pro-Workflows sind zum Planen offen — bezahltes Rendering startet, sobald jedes Modul freigeschaltet ist.",
      statusLabels: {
        available: "Verfügbar",
        credit_gated: "Credits erforderlich",
        preview: "Vorschau",
        request_access: "Zugang anfragen",
        pro: "Pro-Workflow",
        coming_soon: "Demnächst",
      },
      cards: [
        {
          title: "Bild erstellen",
          body: "Erstelle Creator-Visuals, Produktshots und Social Assets aus einer einfachen Idee.",
          status: "available",
        },
        {
          title: "Motion-Video erstellen",
          body: "Verwandle Text in kurze Motion-Clips für Reels, TikTok und Paid Social. 25 Credits pro Render.",
          status: "credit_gated",
        },
        {
          title: "Social Asset Pack",
          body: "Pack-Plan kostenlos in der Vorschau. Volles Rendering kostet 45 Credits — Kosten vor dem Generieren sichtbar.",
          status: "credit_gated",
        },
        {
          title: "Referenzbild nutzen",
          body: "Referenzgeführte Visuals planen. Vorschau im Workflow; Rendering nach Validierung.",
          status: "preview",
        },
        {
          title: "Bild bearbeiten",
          body: "Präzise Edits an Licht, Hintergrund und Komposition planen. Derzeit nur Vorschau.",
          status: "preview",
        },
        {
          title: "Stil anpassen",
          body: "Stil-Matching aus einer Referenz planen. Derzeit nur Vorschau.",
          status: "preview",
        },
        {
          title: "Bild animieren",
          body: "Still in Bewegung verwandeln. Früh Zugang anfragen — noch nicht allgemein verfügbar.",
          status: "request_access",
        },
        {
          title: "LipSync Creator",
          body: "Sprechende Creator-Videos. Pro-Workflow — Upgrade oder Zugang anfragen zum Planen.",
          status: "pro",
        },
        {
          title: "AI Avatar",
          body: "Avatar-Videos im Creator-Stil. Pro-Workflow — Upgrade oder Zugang anfragen zum Planen.",
          status: "pro",
        },
        {
          title: "Creator-Stil trainieren",
          body: "Wiederverwendbarer Look aus deinen Assets. Pro-Training — Vorschau und Zugang anfragen.",
          status: "pro",
        },
        {
          title: "Brand Kit trainieren",
          body: "Konsistente Brand-Visuals für Kampagnen. Pro-Training — Vorschau und Zugang anfragen.",
          status: "pro",
        },
        {
          title: "Produktmodell trainieren",
          body: "Wiederverwendbarer Produkt-Look für E-Commerce und Ads. Pro-Training — Vorschau und Zugang anfragen.",
          status: "pro",
        },
        {
          title: "Asset verbessern",
          body: "Assets für Export hochskalieren und bereinigen. Vorschau im Workflow; Rendering nach Validierung.",
          status: "preview",
        },
        {
          title: "3D Object",
          body: "3D-Style-Produktvisuals für Ads und Social. Pro-Workflow — Zugang anfragen zum Planen.",
          status: "pro",
        },
        {
          title: "Creative Score",
          body: "Kostenloses Feedback zu Hook-Klarheit, Komposition und Social-Tauglichkeit — keine Credits.",
          status: "available",
        },
        {
          title: "Export-Paket",
          body: "Kostenloses Export-Manifest für TikTok, Reels, Story und Feed — keine Überraschungskosten beim Planen.",
          status: "available",
        },
      ] satisfies LandingCreatorToolCard[],
    },
    comparison: {
      headline: "Vorher & nachher",
      subtitle: "Vergleiche einen Entwurf mit einem verfeinerten Studio-Output.",
      beforeLabel: "Entwurf",
      afterLabel: "Studio-Output",
      body: "Prompt Assist und Creative Score helfen dir, Ideen zu verfeinern, bevor du Credits für Generierungen ausgibst.",
    },
    marquee:
      "InfluExAI · AI Creator Studio · Bilder · Motion · Packs · Score · Export · Gallery · ",
    pricing: {
      headline: "Credit-Pakete",
      subheadline:
        "Einmalige Credit-Pakete. Generierung und Rendering verbrauchen Credits — Kosten werden vor dem Generieren angezeigt.",
      oneTime: "einmalig",
      plans: {
        starter: {
          tagline:
            "Ideal zum Testen von Ideen und ersten Assets.",
          buyLabel: "Starter kaufen",
          badge: "",
        },
        professional: {
          badge: "Am beliebtesten",
          tagline:
            "Am besten für regelmäßige Content-Erstellung, Varianten und Video-Workflows.",
          buyLabel: "Creator kaufen",
        },
        ultimate: {
          tagline:
            "Für häufige Creator, Premium-Rendering und größere Workflows.",
          buyLabel: "Pro kaufen",
          badge: "",
        },
      },
    },
    trust: {
      metrics: [
        { value: "Bilder", title: "Hochwertige Creator-Visuals" },
        { value: "Video", title: "Kurze KI-Social-Clips" },
        { value: "Galerie", title: "Integrierte Asset-Bibliothek" },
      ],
      rightsPanel: TRUST_COMMERCIAL_FAQ.de,
      faqTitle: "FAQ",
      faq: [
        {
          q: "Was kann ich heute erstellen?",
          a: "Bild erstellen, Motion-Video erstellen, Social Asset Pack (kostenlose Vorschau; Rendering mit Credits), Creative Score, Hooks & Captions und Export-Paket sind jetzt verfügbar. Referenz-, Bearbeitungs-, Verbesserungs-, Animations- und Trainings-Tools öffnen als Vorschau, Zugang anfragen oder Pro-Workflow — sie rendern erst nach Freigabe.",
        },
        {
          q: "Wie funktionieren Credits?",
          a: "Credits bezahlen Generierung und Rendering. Du siehst die geschätzten Kosten vor jedem Lauf. Kaufe Credit-Pakete bei Bedarf — kein Abo nötig.",
        },
        {
          q: "Was kosten die Credit-Pakete?",
          a: "Starter: 100 Credits für 9 €. Creator: 500 Credits für 29 € (Am beliebtesten). Pro: 2000 Credits für 79 €. Größere Pakete bieten besseren Preis pro Credit. Individuelle Aufladung ab 100 Credits für 0,10 € pro Credit.",
        },
        {
          q: "Ist das ein Abo?",
          a: "Nein. Einmalige Credit-Pakete. Dein Guthaben verfällt nicht.",
        },
        {
          q: "Wo werden meine Assets gespeichert?",
          a: "Fertige Generierungen erscheinen in deiner Creator Gallery, gebunden an deinen Account.",
        },
      ],
    },
    finalCta: {
      headline: "Bereit für dein erstes Asset?",
      cta: "Jetzt erstellen",
    },
    checkout: {
      loading: "Checkout wird geöffnet…",
      error: "Checkout fehlgeschlagen. Anmelden und erneut versuchen.",
    },
  },
} as const;
