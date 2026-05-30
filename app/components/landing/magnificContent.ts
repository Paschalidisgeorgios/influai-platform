export type LandingLanguage = "en" | "de";

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
      product: "Pipeline",
      pricing: "Credits",
      faq: "Spec",
      signIn: "Sign in",
      openStudio: "Enter Engine Room",
    },
    hero: {
      badge: "Campaign Studio · Live",
      headline: "CREATOR AI STUDIO",
      subtitle:
        "Consistent AI assets, reusable brand styles and campaign-ready visuals in minutes.",
      body: "",
      cta: "ENTER ENGINE ROOM",
      renderLabel: "Generate triggered · rendering preview",
      generateLabel: "Generate triggered",
      previewLabel: "Preview",
      resultLabel: "Preview synced · routing next module",
      tracks: [
        {
          title: "1. Brand style stabilized",
          sub: "Style profile, color mood and product direction are compressed into repeatable campaign logic.",
          desc: "",
          typewriter:
            "Luxury skincare campaign, consistent brand palette, studio portrait, campaign-ready --ar 4:5",
          direction: "left",
        },
        {
          title: "2. Motion layer prepared",
          sub: "Camera movement, scene dynamics and social-video format are analyzed for campaign clips.",
          desc: "",
          typewriter:
            "Cinematic push-in, product hero shot, golden hour rim light, social reel format --ar 9:16",
          direction: "right",
        },
        {
          title: "3. Concepts accelerated",
          sub: "Fast variations help test visual directions before spending credits on bigger productions.",
          desc: "",
          typewriter:
            "Three ad variants, same brand style, feed + story formats, quick concept pass --ar 1:1",
          direction: "top",
        },
        {
          title: "4. Best engine selected",
          sub: "The prompt is analyzed by goal, format and asset type to suggest the right workflow.",
          desc: "",
          typewriter:
            "Route to image studio · vertical format · product campaign · smart autopilot",
          direction: "bottom",
        },
      ] satisfies HeroTrack[],
    },
    zoom: {
      headline: "PIXELPERSPEKTIVISCHE INPAINTING-REGENERATION",
      body: "Our neural enhancement core bypasses standard bilinear interpolation. By deploying selective generative inpainting, the processing engine logically recreates missing sensor data, introducing ultra-high frequency micro-textures, clothing fibers, and studio lens diffraction artifacts optimized for massive scale prints up to 22K.",
    },
    video: {
      lipsync: {
        title: "Lip-Sync Preview",
        desc: "Dialogue Sync · Campaign Video",
        pill: "Dialogue Sync",
      },
      motion: {
        title: "Motion Transfer Preview",
        desc: "Motion Mapping · Campaign Video",
        pill: "Motion Mapping",
      },
    },
    creditValue: {
      headline: "Credits are your creative production capacity.",
      subline:
        "Use them flexibly for images, product visuals, campaign formats and future video engines — without a monthly commitment.",
      conversion: "Credits do not expire. Start small and scale when your campaigns grow.",
      tiers: [
        {
          key: "starter" as const,
          title: "Ideal for testing",
          body: "Create first campaign visuals, test prompts and build your first Style Profile.",
        },
        {
          key: "professional" as const,
          title: "For regular content production",
          body: "More credits for product visuals, brand assets and repeatable campaign formats.",
        },
        {
          key: "ultimate" as const,
          title: "For high production velocity",
          body: "More capacity for bigger campaigns, content series and intensive asset production.",
        },
      ],
    },
    campaignFeatures: {
      headline: "From one style to an entire campaign.",
      cards: [
        {
          title: "Style Profile",
          body: "Save your look once and generate consistent assets across formats.",
        },
        {
          title: "Multi-Format Output",
          body: "Create variations for feed, story, reels, ads and product campaigns from one direction.",
        },
        {
          title: "Faster Production",
          body: "Reduce briefing, shooting and design loops with direct visual drafts.",
        },
        {
          title: "Credit Control",
          body: "Start small, test ideas and scale only the assets that work.",
        },
      ],
    },
    comparison: {
      headline: "COMPARE THE CORE.",
      subtitle:
        "Shift the active laser line to inspect sub-pixel asset enhancements.",
      beforeLabel: "RAW BASELINE",
      afterLabel: "NEURAL FINISHED ASSET",
      body: "SPATIAL WEIGHT LOCKING VIA STYLE PROFILES. Our multi-engine stack (utilizing Flux 1.1 Pro Ultra structures and specialized model weights) freezes facial landmarks and core structural tokens. When changing scenes, locations, weather parameters, or focal lenses, the structural integrity of your product or influencer remains fixed within a 98.4% variance threshold.",
    },
    marquee:
      "🚀 ARCHITECTURAL PAYLOAD UPDATED: NETWORK RENDERING MATRIX RUNNING SEEDANCE 2 + KLING 3.0 RUNTIMES • ALL ONE-TIME TOP-UPS ACTIVE • ZERO EXPIRATION LIMITS • ",
    pricing: {
      headline: "CREDIT PACKAGES · ONE-TIME",
      subheadline: "Pay-as-you-go utility. Credits do not expire.",
      oneTime: "once",
      plans: {
        starter: {
          tagline:
            "For first campaign visuals, prompt tests and getting started with repeatable brand styles.",
          buyLabel: "Buy Starter",
          badge: "",
        },
        professional: {
          badge: "Popular",
          tagline:
            "For creators, brands and small teams producing regular content and product visuals.",
          buyLabel: "Buy Professional",
        },
        ultimate: {
          tagline:
            "For agencies and power users producing many assets, formats and campaign variations.",
          buyLabel: "Buy Ultimate",
          badge: "",
        },
      },
    },
    trust: {
      metrics: [
        { value: "22K", title: "max upscale output resolution" },
        { value: "<800ms", title: "avg queue dispatch latency" },
        { value: "98.4%", title: "structural variance lock threshold" },
      ],
      faqTitle: "Technical Spec",
      faq: [
        {
          q: "Which framework nodes are active?",
          a: "Flux 1.1 Pro Ultra (image), Kling 3.0 (video), Runway (motion), Voice Sync (audio) — orchestrated via InfluExAI Smart Routing.",
        },
        {
          q: "How are Style Profiles stored?",
          a: "15-image reference datasets are embedded as weight anchors. Structural tokens persist across scene, lens, and lighting parameter changes.",
        },
        {
          q: "Is this a subscription?",
          a: "No. One-time credit packs. No expiration timestamps on balance.",
        },
        {
          q: "Where is data processed?",
          a: "Workspace-scoped storage. Uploads and outputs remain tied to authenticated account sessions.",
        },
      ],
    },
    finalCta: {
      headline: "ENGINE ROOM READY FOR INPUT.",
      cta: "ENTER ENGINE ROOM",
    },
    checkout: {
      loading: "Opening secure checkout session…",
      error: "Checkout session failed. Authenticate and retry.",
    },
  },
  de: {
    nav: {
      product: "Pipeline",
      pricing: "Credits",
      faq: "Spec",
      signIn: "Einloggen",
      openStudio: "Engine Room öffnen",
    },
    hero: {
      badge: "Campaign Studio · Live",
      headline: "CREATOR AI STUDIO",
      subtitle:
        "Konsistente KI-Assets, wiederverwendbare Markenstile und kampagnenfähige Visuals in Minuten.",
      body: "",
      cta: "ENGINE ROOM BETRETEN",
      renderLabel: "Generierung ausgelöst · Preview wird gerendert",
      generateLabel: "Generierung ausgelöst",
      previewLabel: "Preview",
      resultLabel: "Preview synchronisiert · nächstes Modul",
      tracks: [
        {
          title: "1. Markenstil wird stabilisiert",
          sub: "Style Profile, Farbklima und Produktlook werden zu einer wiederholbaren Kampagnenlogik verdichtet.",
          desc: "",
          typewriter:
            "Luxus-Skincare-Kampagne, konsistente Markenpalette, Studio-Portrait, kampagnenfähig --ar 4:5",
          direction: "left",
        },
        {
          title: "2. Motion-Layer wird vorbereitet",
          sub: "Kamerabewegung, Szenendynamik und Social-Video-Format werden für Kampagnenclips analysiert.",
          desc: "",
          typewriter:
            "Kinematischer Push-In, Product-Hero-Shot, Golden-Hour-Rim-Light, Social-Reel-Format --ar 9:16",
          direction: "right",
        },
        {
          title: "3. Konzepte werden beschleunigt",
          sub: "Schnelle Varianten helfen dir, visuelle Richtungen zu testen, bevor du Credits in große Produktionen investierst.",
          desc: "",
          typewriter:
            "Drei Ad-Varianten, gleicher Markenstil, Feed + Story, schneller Konzept-Pass --ar 1:1",
          direction: "top",
        },
        {
          title: "4. Beste Engine wird gewählt",
          sub: "Der Prompt wird nach Ziel, Format und Asset-Typ analysiert, um den passenden Workflow vorzuschlagen.",
          desc: "",
          typewriter:
            "Routing zum Image Studio · vertikales Format · Produktkampagne · Smart Autopilot",
          direction: "bottom",
        },
      ] satisfies HeroTrack[],
    },
    zoom: {
      headline: "PIXELPERSPEKTIVISCHE INPAINTING-REGENERATION",
      body: "Unser neuronaler Enhancement-Kern umgeht standardmäßige bilineare Interpolation. Durch den Einsatz von selektivem generativen Inpainting rekonstruiert die Engine fehlende Sensordaten logisch und fügt ultra-hochfrequente Mikrotexturen, Stofffasern und Objektivbeugungs-Artefakte hinzu, optimiert für Großformatdrucke bis zu einer Auflösung von 22K.",
    },
    video: {
      lipsync: {
        title: "Lip-Sync Preview",
        desc: "Dialogue Sync · Campaign Video",
        pill: "Dialogue Sync",
      },
      motion: {
        title: "Motion Transfer Preview",
        desc: "Motion Mapping · Campaign Video",
        pill: "Motion Mapping",
      },
    },
    creditValue: {
      headline: "Credits sind dein kreativer Produktions-Spielraum.",
      subline:
        "Nutze sie flexibel für Bilder, Produktvisuals, Kampagnenformate und später Video-Engines — ohne monatliche Verpflichtung.",
      conversion: "Credits verfallen nicht. Starte klein und skaliere, wenn deine Kampagnen wachsen.",
      tiers: [
        {
          key: "starter" as const,
          title: "Ideal zum Testen",
          body: "Erstelle erste Kampagnenvisuals, teste Prompts und baue dein erstes Style Profile.",
        },
        {
          key: "professional" as const,
          title: "Für regelmäßige Content-Produktion",
          body: "Mehr Credits für Produktvisuals, Brand Assets und wiederholbare Kampagnenformate.",
        },
        {
          key: "ultimate" as const,
          title: "Für hohe Produktionsgeschwindigkeit",
          body: "Mehr Spielraum für größere Kampagnen, Serienformate und intensive Asset-Produktion.",
        },
      ],
    },
    campaignFeatures: {
      headline: "Von einem Stil zu einer ganzen Kampagne.",
      cards: [
        {
          title: "Style Profile",
          body: "Speichere deinen Look einmal und erzeuge konsistente Assets über mehrere Formate hinweg.",
        },
        {
          title: "Multi-Format Output",
          body: "Erstelle Varianten für Feed, Story, Reel, Ads und Produktkampagnen aus einer Richtung.",
        },
        {
          title: "Faster Production",
          body: "Reduziere Briefing-, Shooting- und Design-Schleifen durch direkte visuelle Entwürfe.",
        },
        {
          title: "Credit Control",
          body: "Starte klein, teste Ideen und skaliere nur die Assets, die funktionieren.",
        },
      ],
    },
    comparison: {
      headline: "CORE-QUALITÄT.",
      subtitle:
        "Bewege die Laserlinie, um die sub-pixel-genaue Bildverbesserung zu prüfen.",
      beforeLabel: "UNVERARBEITETE ROHDATEN",
      afterLabel: "NEURONALES ENDERGEBNIS",
      body: "RÄUMLICHE GEWICHTSSPERRUNG PER STYLE-PROFILE. Unser Multi-Engine-Stack (basierend auf Flux 1.1 Pro Ultra Strukturen und spezialisierten Modellgewichten) friert Gesichtsmerkmale und strukturelle Token ein. Bei Änderungen von Szenerie, Ort, Wetter oder Objektiven bleibt die strukturelle Identität Ihres Produkts oder Modells innerhalb einer Toleranzgrenze von 98,4% absolut fixiert.",
    },
    marquee:
      "🚀 SYSTEM-UPDATE: NETZWERK-RENDERING-MATRIX LAUFEN AUF SEEDANCE 2 + KLING 3.0 RUNTIMES • ALLE EINMAL-TOP-UPS AKTIV • KEIN ABLAUFDATUM • ",
    pricing: {
      headline: "CREDIT-PAKETE · EINMALIG",
      subheadline: "Pay-as-you-go. Credits verfallen nicht.",
      oneTime: "einmalig",
      plans: {
        starter: {
          tagline:
            "Für erste Kampagnenvisuals, Prompt-Tests und den Einstieg in wiederholbare Markenstile.",
          buyLabel: "Starter kaufen",
          badge: "",
        },
        professional: {
          badge: "Beliebt",
          tagline:
            "Für Creator, Marken und kleine Teams, die regelmäßig Content und Produktvisuals erstellen.",
          buyLabel: "Professional kaufen",
        },
        ultimate: {
          tagline:
            "Für Agenturen und Power-User, die viele Assets, Formate und Kampagnenvarianten produzieren.",
          buyLabel: "Ultimate kaufen",
          badge: "",
        },
      },
    },
    trust: {
      metrics: [
        { value: "22K", title: "max. Upscale-Auflösung" },
        { value: "<800ms", title: "Ø Queue-Dispatch-Latenz" },
        { value: "98,4%", title: "strukturelle Varianz-Sperre" },
      ],
      faqTitle: "Technische Spec",
      faq: [
        {
          q: "Welche Framework-Nodes sind aktiv?",
          a: "Flux 1.1 Pro Ultra (Bild), Kling 3.0 (Video), Runway (Motion), Voice Sync (Audio) — orchestriert über InfluExAI Smart Routing.",
        },
        {
          q: "Wie werden Style Profiles gespeichert?",
          a: "15-Bild-Referenzdatensätze als Gewichtsanker. Strukturelle Token bleiben über Szenen-, Objektiv- und Lichtparameter erhalten.",
        },
        {
          q: "Ist das ein Abo?",
          a: "Nein. Einmalige Credit-Pakete. Kein Ablaufdatum auf dem Guthaben.",
        },
        {
          q: "Wo werden Daten verarbeitet?",
          a: "Workspace-gebundener Speicher. Uploads und Outputs bleiben an authentifizierte Account-Sessions gebunden.",
        },
      ],
    },
    finalCta: {
      headline: "ENGINE ROOM BEREIT FÜR INPUT.",
      cta: "ENGINE ROOM BETRETEN",
    },
    checkout: {
      loading: "Checkout-Session wird geöffnet…",
      error: "Checkout fehlgeschlagen. Authentifizieren und erneut versuchen.",
    },
  },
} as const;
