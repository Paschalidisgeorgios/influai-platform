"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Sparkles,
  Wand2,
  UserRound,
  GalleryVerticalEnd,
  CreditCard,
  Check,
  Layers,
  Film,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PricingSection } from "./PricingSection";
import { RoadmapSection } from "./RoadmapSection";

type Props = {
  images: string[];
  bodyFontClass: string;
  headingFontClass: string;
};

type Language = "en" | "de";

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.16 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted]);

  const hidden = mounted && !visible;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        hidden ? "translate-y-16 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {children}
    </div>
  );
}

export default function AiinflugenLanding({
  images,
  bodyFontClass,
  headingFontClass,
}: Props) {
  const [language, setLanguage] = useState<Language>("en");
  const [activeSlide, setActiveSlide] = useState(0);
  const examplesRef = useRef<HTMLDivElement | null>(null);

  function scrollExamples(direction: "left" | "right") {
    if (!examplesRef.current) return;

    examplesRef.current.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  }

  const slides = useMemo(() => images, [images]);
  const galleryImages = useMemo(() => images, [images]);

  const text = {
    en: {
      product: "Product",
      tools: "Tools",
      pricing: "Pricing",
      creators: "Examples",
      signIn: "Sign in",
      openApp: "Open Studio",
      label: "InfluExAi · AI Creator Studio",
      title1: "Campaign-ready",
      title2: "AI visuals",
      gold: "campaigns",
      subtitle:
        "InfluExAi is an AI Campaign Studio for creators, brands and businesses who want to produce campaign-ready visuals faster.",
      start: "Open Studio",
      startCreating: "Start creating",
      explore: "Explore features",
      studioTitle: "One studio for the full visual workflow.",
      studioText:
        "Turn ideas into professional visuals for social media, product campaigns and digital ads with reusable styles and a complete asset workflow.",
      toolsTitle: "Designed for repeatable, on-brand output.",
      workflowTitle: "From brief to finished assets.",
      examplesTitle: "Campaign-ready examples.",
      pricingTitle: "Choose your credit package.",
      pricingNote:
        "Credits are only used when you generate. Standard images cost 1 credit.",
      secure: "Secure checkout via Stripe",
      powered: "Core platform capabilities",
      badgeLive: "Live",
      badgeComingSoon: "Coming soon",
      badgePlanned: "Planned",
      badgeRoadmap: "Roadmap",
      trustTitle: "Trust & FAQ",
      trustSubtitle:
        "Clear pricing, private assets, and a simple workflow. Here are the most common questions.",
      faq: [
        {
          q: "What do credits cover?",
          a: "Credits are consumed when you generate. The cost depends on the selected mode (shown in the studio).",
        },
        {
          q: "Do previews or browsing cost credits?",
          a: "No. Browsing the gallery and playing local previews does not consume credits.",
        },
        {
          q: "Where do my assets live?",
          a: "Generated assets are saved to your account’s Asset Gallery for easy reuse and download.",
        },
        {
          q: "Can I reuse a look across a campaign?",
          a: "Yes. Style Profiles store reusable creative direction (look, mood, styling) so results stay consistent.",
        },
      ],
    },
    de: {
      product: "Produkt",
      tools: "Tools",
      pricing: "Preise",
      creators: "Beispiele",
      signIn: "Einloggen",
      openApp: "Studio öffnen",
      label: "InfluExAi · AI Creator Studio",
      title1: "Kampagnenfertige",
      title2: "AI-Visuals",
      gold: "Kampagnen",
      subtitle:
        "Erstelle kampagnenfähige KI-Visuals in Minuten. InfluExAi ist ein AI Campaign Studio für Creator, Marken und Unternehmen.",
      start: "Studio öffnen",
      startCreating: "Jetzt erstellen",
      explore: "Features entdecken",
      studioTitle: "Ein Studio für den gesamten Visual-Workflow.",
      studioText:
        "Verwandle Ideen in professionelle Visuals für Social Media, Produktkampagnen und digitale Werbung – mit wiederverwendbaren Styles und vollständigem Asset-Workflow.",
      toolsTitle: "Für wiederholbaren, markenkonsistenten Output.",
      workflowTitle: "Vom Briefing zu fertigen Assets.",
      examplesTitle: "Kampagnenfertige Beispiele.",
      pricingTitle: "Wähle dein Credit-Paket.",
      pricingNote:
        "Credits werden nur beim Generieren verbraucht. Standard-Bilder kosten 1 Credit.",
      secure: "Sichere Zahlung über Stripe",
      powered: "Kernfunktionen der Plattform",
      badgeLive: "Live",
      badgeComingSoon: "Demnächst",
      badgePlanned: "Geplant",
      badgeRoadmap: "Roadmap",
      trustTitle: "Trust & FAQ",
      trustSubtitle:
        "Klare Preise, private Assets und ein einfacher Workflow. Hier sind die häufigsten Fragen.",
      faq: [
        {
          q: "Wofür werden Credits genutzt?",
          a: "Credits werden beim Generieren verbraucht. Die Kosten hängen vom Modus ab (im Studio sichtbar).",
        },
        {
          q: "Kosten Preview oder Galerie Credits?",
          a: "Nein. Galerie-Browsing und lokale Vorschauen verbrauchen keine Credits.",
        },
        {
          q: "Wo landen meine Assets?",
          a: "Generierte Assets werden in deiner Asset Gallery gespeichert – zum Wiederverwenden und Download.",
        },
        {
          q: "Kann ich einen Look für eine Kampagne wiederverwenden?",
          a: "Ja. Style Profiles speichern Creative Direction (Look, Mood, Styling) für konsistentere Ergebnisse.",
        },
      ],
    },
  };

  const t = text[language];

  const studioCapabilities = useMemo(() => {
    const videoLive =
      process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
    const lipSyncLive =
      process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true";

    return [
      { label: "AI Visual Agent", status: "live" as const },
      { label: "Style Profiles", status: "live" as const },
      { label: "Social Formats", status: "live" as const },
      { label: "Asset Gallery", status: "live" as const },
      { label: "Credits", status: "live" as const },
      {
        label: "Video Studio",
        status: videoLive ? ("live" as const) : ("coming_soon" as const),
      },
      {
        label: "Lip Sync Studio",
        status: lipSyncLive ? ("live" as const) : ("coming_soon" as const),
      },
      { label: "Cinema Agent", status: "planned" as const },
      { label: "Omni Campaign Agent", status: "roadmap" as const },
      { label: "Social Planner", status: "planned" as const },
    ];
  }, []);

  const tools = [
    {
      title: language === "en" ? "AI Visual Agent" : "AI Visual Agent",
      description:
        language === "en"
          ? "Turn briefs into campaign-ready visuals with guided modes and social format presets."
          : "Wandle Briefings in kampagnenfertige Visuals um – mit geführten Modi und Social-Format-Presets.",
      icon: Sparkles,
    },
    {
      title: language === "en" ? "Style Profiles" : "Style Profiles",
      description:
        language === "en"
          ? "Save reusable creative direction (look, mood, styling) to keep outputs consistent."
          : "Speichere wiederverwendbare Creative Direction (Look, Mood, Styling) für konsistente Ergebnisse.",
      icon: UserRound,
    },
    {
      title: language === "en" ? "Social Formats" : "Social Formats",
      description:
        language === "en"
          ? "Generate in the formats you ship: posts, stories, shorts and campaign placements."
          : "Generiere in den Formaten, die du brauchst: Posts, Stories, Shorts und Placements.",
      icon: Film,
    },
    {
      title: language === "en" ? "Asset Gallery" : "Asset Gallery",
      description:
        language === "en"
          ? "Review results, save favorites, and download campaign assets in one place."
          : "Ergebnisse prüfen, Favoriten speichern und Kampagnenassets herunterladen – an einem Ort.",
      icon: GalleryVerticalEnd,
    },
  ];

  const workflow = [
    {
      title: language === "en" ? "Define style profile" : "Style Profile anlegen",
      description:
        language === "en"
          ? "Set your reusable creative direction (look, mood, styling)."
          : "Lege wiederverwendbare Creative Direction fest (Look, Mood, Styling).",
      icon: UserRound,
    },
    {
      title: language === "en" ? "Generate with agent" : "Mit Agent generieren",
      description:
        language === "en"
          ? "Generate with the mode and social format you need. Credits are shown before you run."
          : "Generiere mit dem passenden Modus und Social-Format. Credits siehst du vorher.",
      icon: Sparkles,
    },
    {
      title: language === "en" ? "Manage assets" : "Assets verwalten",
      description:
        language === "en"
          ? "Track processing, review results, and reuse the best assets for your campaign."
          : "Processing verfolgen, Ergebnisse prüfen und die besten Assets wiederverwenden.",
      icon: Layers,
    },
  ];

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <main className={`${bodyFontClass} min-h-screen bg-black text-white`}>
      <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-5">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 rounded-[1.7rem] border border-white/15 bg-black/35 px-4 py-3 shadow-2xl backdrop-blur-2xl sm:rounded-full sm:px-7">
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-[0.45em] text-white sm:text-sm sm:tracking-[0.55em]"
          >
            Influ<span className="text-[#d8ad5f]">ExAi</span>
          </Link>

          <nav className="order-3 flex w-full items-center justify-center gap-5 overflow-x-auto whitespace-nowrap text-[11px] font-semibold text-white/70 [scrollbar-width:none] sm:order-none sm:w-auto sm:gap-7 sm:text-sm lg:gap-10 [&::-webkit-scrollbar]:hidden">
            <a href="#studio" className="transition hover:text-[#d8ad5f]">
              {t.product}
            </a>
            <a href="#tools" className="transition hover:text-[#d8ad5f]">
              {t.tools}
            </a>
            <a href="#pricing" className="transition hover:text-[#d8ad5f]">
              {t.pricing}
            </a>
            <a href="#examples" className="transition hover:text-[#d8ad5f]">
              {t.creators}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold transition sm:px-3 sm:py-2 sm:text-xs ${
                  language === "en"
                    ? "bg-[#d8ad5f] text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setLanguage("de")}
                className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold transition sm:px-3 sm:py-2 sm:text-xs ${
                  language === "de"
                    ? "bg-[#d8ad5f] text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                DE
              </button>
            </div>

            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-white/75 transition hover:border-[#d8ad5f]/40 hover:text-[#d8ad5f] sm:px-4 sm:text-xs md:border-transparent md:bg-transparent md:px-0 md:py-0 md:text-sm md:font-semibold"
            >
              {t.signIn}
            </Link>

            <Link
              href="/login"
              className="inline-flex rounded-full bg-[#d8ad5f] px-4 py-2.5 text-[10px] font-extrabold text-black transition hover:bg-[#efc777] sm:px-6 sm:py-3 sm:text-sm"
            >
              {t.openApp}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-black" />

        <div className="absolute inset-0">
          {slides.length > 0 ? (
            slides.map((src, index) => {
              const active = index === activeSlide;

              return (
                <div
                  key={`${src}-${index}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`InfluExAi slide ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    quality={100}
                    unoptimized
                    className={`object-cover object-[center_10%] transition-transform duration-[7000ms] ease-out ${
                      active ? "scale-[1.08]" : "scale-100"
                    }`}
                  />
                </div>
              );
            })
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1a1a1a] via-black to-[#3a2410]" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/85" />

        <div className="relative z-20 flex min-h-screen items-center justify-start px-5 pt-36 sm:px-8 sm:pt-28 lg:px-16">
          <div className="max-w-3xl">
            <p className="hero-label mb-6 text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#d8ad5f] sm:mb-8 sm:text-xs sm:tracking-[0.42em]">
              {t.label}
            </p>

            <h1
              className={`${headingFontClass} hero-title text-[3rem] font-bold leading-[0.92] tracking-[-0.06em] text-white sm:text-[5.4rem] lg:text-[6.8rem]`}
            >
              {t.title1}
              <br />
              {t.title2} <span className="text-[#d8ad5f]">{t.gold}</span>
            </h1>

            <p className="hero-subtitle mt-8 max-w-xl text-base leading-7 text-white/60 sm:text-xl">
              {t.subtitle}
            </p>

            <div className="hero-buttons mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[#d8ad5f] px-8 py-4 text-sm font-extrabold text-black transition hover:bg-[#efc777]"
              >
                {t.start}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-extrabold text-white backdrop-blur-xl transition hover:border-[#d8ad5f]/60 hover:text-[#d8ad5f]"
              >
                {t.startCreating}
              </Link>

              <a
                href="#tools"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-extrabold text-white backdrop-blur-xl transition hover:border-[#d8ad5f]/60 hover:text-[#d8ad5f]"
              >
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                  <Play className="h-4 w-4" />
                </span>
                {t.explore}
              </a>
            </div>

            <div className="hero-tools mt-16 hidden sm:block">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.42em] text-white/45">
                {t.powered}
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  "AI Visual Agent",
                  "Style Profiles",
                  "Social Formats",
                  "Credits",
                ].map((tool) => (
                  <div
                    key={tool}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/60 backdrop-blur-xl transition hover:border-[#d8ad5f]/40 hover:text-[#d8ad5f]"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 z-20 flex max-w-[70vw] -translate-x-1/2 items-center gap-2 overflow-hidden">
            {slides.slice(0, 28).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-1 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-10 bg-[#d8ad5f]"
                    : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <section id="studio" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
            {t.product}
          </p>

          <h2
            className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
          >
            {t.studioTitle}
          </h2>

          <p className="mt-8 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            {t.studioText}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studioCapabilities.map((item, index) => {
            const isLive = item.status === "live";
            const badgeLabel =
              item.status === "coming_soon"
                ? t.badgeComingSoon
                : item.status === "planned"
                  ? t.badgePlanned
                  : item.status === "roadmap"
                    ? t.badgeRoadmap
                    : t.badgeLive;

            return (
              <Reveal key={item.label} delay={index * 80}>
                <div
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition ${
                    isLive
                      ? "border-white/10 bg-white/[0.035] hover:border-[#d8ad5f]/35"
                      : "border-white/[0.08] bg-white/[0.02] opacity-90"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {isLive ? (
                      <Check className="h-4 w-4 shrink-0 text-[#d8ad5f]" />
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 text-white/30" />
                    )}
                    <span
                      className={`truncate text-sm font-semibold ${
                        isLive ? "text-white/75" : "text-white/50"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {!isLive && (
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] ${
                        item.status === "coming_soon"
                          ? "border-[#d8ad5f]/30 bg-[#d8ad5f]/10 text-[#d8ad5f]"
                          : item.status === "roadmap"
                            ? "border-violet-500/25 bg-violet-500/10 text-violet-200"
                            : "border-white/10 bg-white/[0.04] text-white/40"
                      }`}
                    >
                      {badgeLabel}
                    </span>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
            {t.tools}
          </p>

          <h2
            className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
          >
            {t.toolsTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <Reveal key={tool.title} delay={index * 120}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#d8ad5f]/45">
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-xl font-extrabold text-white">
                    {tool.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/50">
                    {tool.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
            Workflow
          </p>

          <h2
            className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
          >
            {t.workflowTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {workflow.map((step, index) => {
            const Icon = step.icon;

            return (
              <Reveal key={step.title} delay={index * 150}>
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-[#d8ad5f]/35">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className={`${headingFontClass} text-5xl font-bold text-white/10`}
                    >
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold">{step.title}</h3>

                  <p className="mt-4 text-sm leading-7 text-white/52">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="examples" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
                {t.creators}
              </p>

              <h2
                className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
              >
                {t.examplesTitle}
              </h2>
            </div>

            <div className="hidden gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollExamples("left")}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white backdrop-blur-xl transition hover:border-[#d8ad5f]/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollExamples("right")}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white backdrop-blur-xl transition hover:border-[#d8ad5f]/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>

        <div
          ref={examplesRef}
          className="mt-12 flex gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {galleryImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative h-[420px] min-w-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#080808] sm:min-w-[340px]"
            >
              <Image
                src={src}
                alt={`InfluExAi example ${index + 1}`}
                fill
                sizes="340px"
                quality={100}
                unoptimized
                className="object-cover object-[center_25%] transition duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <RoadmapSection language={language} headingFontClass={headingFontClass} />

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
            {t.trustTitle}
          </p>
          <h2
            className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
          >
            {t.trustTitle}
          </h2>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            {t.trustSubtitle}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {t.faq.map((item, index) => (
            <Reveal key={item.q} delay={index * 90}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-[#d8ad5f]/35">
                <p className="text-base font-extrabold text-white">{item.q}</p>
                <p className="mt-3 text-sm leading-7 text-white/55">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <PricingSection
          language={language}
          headingFontClass={headingFontClass}
          secureLabel={t.secure}
          pricingTitle={t.pricingTitle}
          pricingNote={t.pricingNote}
          getStartedLabel={language === "en" ? "Start creating" : "Jetzt erstellen"}
        />
      </Reveal>

      <style jsx global>{`
        .hero-label {
          opacity: 0;
          transform: translateY(18px);
          filter: blur(10px);
          animation: heroReveal 0.9s ease-out forwards;
        }

        .hero-title {
          opacity: 0;
          transform: translateY(32px);
          filter: blur(18px);
          animation: heroReveal 1.2s ease-out forwards;
          animation-delay: 120ms;
        }

        .hero-subtitle {
          opacity: 0;
          transform: translateY(28px);
          filter: blur(14px);
          animation: heroReveal 1.1s ease-out forwards;
          animation-delay: 280ms;
        }

        .hero-buttons {
          opacity: 0;
          transform: translateY(24px);
          filter: blur(10px);
          animation: heroReveal 1s ease-out forwards;
          animation-delay: 420ms;
        }

        .hero-tools {
          opacity: 0;
          transform: translateY(24px);
          filter: blur(10px);
          animation: heroReveal 1s ease-out forwards;
          animation-delay: 560ms;
        }

        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(32px);
            filter: blur(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </main>
  );
}