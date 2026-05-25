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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
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
      creators: "Creators",
      signIn: "Sign in",
      openApp: "Open App",
      label: "AI Creator Studio",
      title1: "Premium AI visuals",
      title2: "for creator",
      gold: "campaigns",
      subtitle:
        "InfluExAi is an enterprise-grade AI Creator Studio for campaign visuals, social formats, style profiles and asset management — built for modern creator teams.",
      start: "Open Studio",
      demo: "View Examples",
      studioTitle: "One studio for the full visual workflow.",
      studioText:
        "InfluExAi combines an AI Visual Agent, Style Profiles, Social Formats, Asset Gallery and Credits in one professional creator platform.",
      toolsTitle: "Built for production-ready creator output.",
      workflowTitle: "From brief to published visual.",
      examplesTitle: "Campaign visual examples.",
      pricingTitle: "Choose your credit package.",
      secure: "Secure checkout via Stripe",
      powered: "Core platform capabilities",
    },
    de: {
      product: "Produkt",
      tools: "Tools",
      pricing: "Preise",
      creators: "Creator",
      signIn: "Einloggen",
      openApp: "App öffnen",
      label: "AI Creator Studio",
      title1: "Premium AI-Visuals",
      title2: "für Creator",
      gold: "Kampagnen",
      subtitle:
        "InfluExAi ist ein professionelles AI Creator Studio für Kampagnenvisuals, Social Formats, Style Profiles und Asset Management — entwickelt für moderne Creator-Teams.",
      start: "Studio öffnen",
      demo: "Beispiele ansehen",
      studioTitle: "Ein Studio für den gesamten Visual-Workflow.",
      studioText:
        "InfluExAi verbindet AI Visual Agent, Style Profiles, Social Formats, Asset Gallery und Credits in einer professionellen Creator-Plattform.",
      toolsTitle: "Gebaut für produktionsreife Creator-Ergebnisse.",
      workflowTitle: "Vom Briefing zum fertigen Visual.",
      examplesTitle: "Kampagnen-Beispielvisuals.",
      pricingTitle: "Wähle dein Credit-Paket.",
      secure: "Sichere Zahlung über Stripe",
      powered: "Kernfunktionen der Plattform",
    },
  };

  const t = text[language];

  const tools = [
    {
      title: language === "en" ? "AI Visual Agent" : "AI Visual Agent",
      description:
        language === "en"
          ? "Generate premium campaign visuals from natural-language briefs with guided creative modes."
          : "Erzeuge Premium-Kampagnenvisuals aus natürlichen Briefings mit geführten Creative-Modi.",
      icon: Sparkles,
    },
    {
      title: language === "en" ? "Style Profiles" : "Style Profiles",
      description:
        language === "en"
          ? "Define reusable creative direction for look, mood, styling and brand aesthetics."
          : "Definiere wiederverwendbare Creative Direction für Look, Mood, Styling und Brand-Aesthetics.",
      icon: UserRound,
    },
    {
      title: language === "en" ? "Social Formats" : "Social Formats",
      description:
        language === "en"
          ? "Export-ready formats for posts, stories, shorts and campaign placements."
          : "Exportfertige Formate für Posts, Stories, Shorts und Kampagnen-Placements.",
      icon: Film,
    },
    {
      title: language === "en" ? "Asset Gallery" : "Asset Gallery",
      description:
        language === "en"
          ? "Review, favorite, download and organize every generated visual in one place."
          : "Prüfe, favorisiere, lade herunter und organisiere jedes generierte Visual an einem Ort.",
      icon: GalleryVerticalEnd,
    },
  ];

  const workflow = [
    {
      title: language === "en" ? "Define style profile" : "Style Profile anlegen",
      description:
        language === "en"
          ? "Set appearance and style direction for repeatable campaign aesthetics."
          : "Lege Appearance- und Style-Direction für wiederholbare Kampagnen-Ästhetik fest.",
      icon: UserRound,
    },
    {
      title: language === "en" ? "Generate with agent" : "Mit Agent generieren",
      description:
        language === "en"
          ? "Turn briefs into premium AI visuals with social format presets and credits."
          : "Wandle Briefings in Premium-AI-Visuals mit Social-Format-Presets und Credits um.",
      icon: Sparkles,
    },
    {
      title: language === "en" ? "Manage assets" : "Assets verwalten",
      description:
        language === "en"
          ? "Track processing, completed and failed jobs in your Asset Gallery."
          : "Verfolge Processing-, Completed- und Failed-Jobs in deiner Asset Gallery.",
      icon: Layers,
    },
  ];

  const pricing = [
    {
      name: "Starter",
      credits: "100 Credits",
      description:
        language === "en"
          ? "Perfect for first AI creator visuals."
          : "Perfekt für erste AI-Creator-Visuals.",
      highlight: false,
    },
    {
      name: "Professional",
      credits: "500 Credits",
      description:
        language === "en"
          ? "For regular creator workflows."
          : "Für regelmäßige Creator-Workflows.",
      highlight: true,
    },
    {
      name: "Ultimate",
      credits: "2000 Credits",
      description:
        language === "en"
          ? "For larger content productions."
          : "Für große Content-Produktionen.",
      highlight: false,
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
            <a href="#studio" className="transition hover:text-white">
              {t.product}
            </a>
            <a href="#tools" className="transition hover:text-white">
              {t.tools}
            </a>
            <a href="#pricing" className="transition hover:text-white">
              {t.pricing}
            </a>
            <a href="#examples" className="transition hover:text-white">
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
              className="hidden text-sm font-semibold text-white/65 transition hover:text-white md:block"
            >
              {t.signIn}
            </Link>

            <Link
              href="/dashboard"
              className="hidden rounded-full bg-[#d8ad5f] px-5 py-3 text-xs font-extrabold text-black transition hover:bg-[#f0c979] sm:inline-flex sm:px-6 sm:text-sm"
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
                    className={`object-cover object-[center_20%] transition-transform duration-[7000ms] ease-out ${
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

            <div className="hero-buttons mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[#d8ad5f] px-8 py-4 text-sm font-extrabold text-black transition hover:bg-[#f0c979]"
              >
                {t.start}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <a
                href="#examples"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-extrabold text-white backdrop-blur-xl transition hover:border-[#d8ad5f]/60"
              >
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                  <Play className="h-4 w-4" />
                </span>
                {t.demo}
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
                  "OpenAI",
                ].map((tool) => (
                  <div
                    key={tool}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/60 backdrop-blur-xl"
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
          {[
            "AI Visual Agent",
            "Style Profiles",
            "Social Formats",
            "Asset Gallery",
            "Credits & Stripe",
            "Video Studio coming soon",
          ].map((item, index) => (
            <Reveal key={item} delay={index * 80}>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
                <Check className="h-4 w-4 text-[#d8ad5f]" />
                <span className="text-sm font-semibold text-white/75">
                  {item}
                </span>
              </div>
            </Reveal>
          ))}
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
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.035] p-7">
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
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
            {t.pricing}
          </p>

          <h2
            className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
          >
            {t.pricingTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 150}>
              <div
                className={`relative rounded-3xl border p-7 ${
                  plan.highlight
                    ? "border-[#d8ad5f]/70 bg-[#d8ad5f]/10"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                {plan.highlight && (
                  <div className="mb-5 inline-flex rounded-full bg-[#d8ad5f] px-3 py-1 text-xs font-extrabold text-black">
                    Recommended
                  </div>
                )}

                <h3 className="text-2xl font-extrabold">{plan.name}</h3>

                <p className="mt-5 text-4xl font-extrabold text-[#d8ad5f]">
                  {plan.credits}
                </p>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-white/45">
                  <CreditCard className="h-4 w-4" />
                  {t.secure}
                </div>

                <Link
                  href="/dashboard"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#d8ad5f] px-5 py-3 text-sm font-extrabold text-black transition hover:bg-[#f0c979]"
                >
                  {t.openApp}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/35">
              {language === "en" ? "Expansion roadmap" : "Roadmap"}
            </p>

            <p className="mt-3 text-sm leading-6 text-white/45">
              {language === "en"
                ? "Video Studio, Lip Sync Studio and Automation are planned modules — not available in the current release."
                : "Video Studio, Lip Sync Studio und Automation sind geplante Module — in der aktuellen Version noch nicht verfügbar."}
            </p>
          </div>
        </Reveal>
      </section>

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