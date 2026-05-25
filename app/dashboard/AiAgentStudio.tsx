"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Clapperboard,
  ExternalLink,
  GalleryVerticalEnd,
  ImageIcon,
  ImageOff,
  Loader2,
  Lock,
  Megaphone,
  MonitorPlay,
  PenLine,
  Plus,
  Search,
  Send,
  Sparkles,
  Square,
  UserRound,
  Wand2,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "./DashboardLanguageProvider";
import { formatCopy } from "./i18n";

type Character = {
  id: string;
  name: string;
  reference_image_url: string | null;
  face_workflow?: string | null;
};

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
};

type Workflow = "standard";
type AgentMode = "auto" | "portrait" | "product" | "campaign";
type ImageModeKey = "standard" | "fast_draft" | "premium" | "reference_edit";
type ImageModeStatus = "live" | "planned";

type OutputFormatKey =
  | "square"
  | "tiktok"
  | "instagram_post"
  | "instagram_story"
  | "youtube_thumbnail"
  | "youtube_shorts";

type OutputFormat = {
  key: OutputFormatKey;
  label: string;
  platform: string;
  ratio: string;
  description: string;
  icon: typeof Square;
};

type AgentResult = {
  id: string;
  prompt: string;
  image_url: string | null;
  status: "processing" | "completed" | "failed";
  error_message: string | null;
  output_format?: string | null;
  image_size?: string | null;
};

type AiAgentStudioProps = {
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onGenerationQueued?: () => void;
  onClearRegenerateDraft?: () => void;
  onOpenGallery?: () => void;
};

const agentModes: {
  key: AgentMode;
  label: string;
  description: string;
}[] = [
  {
    key: "auto",
    label: "Auto",
    description: "Balanced creative direction for most prompts.",
  },
  {
    key: "portrait",
    label: "Portrait",
    description:
      "Best for creator portraits, editorials and people-focused visuals.",
  },
  {
    key: "product",
    label: "Product",
    description: "Best for product shots, brand visuals and ad creatives.",
  },
  {
    key: "campaign",
    label: "Campaign",
    description: "Best for social ads, campaign concepts and creator marketing.",
  },
];

const outputFormats: OutputFormat[] = [
  {
    key: "square",
    label: "Square",
    platform: "General",
    ratio: "1:1",
    description: "Universal post",
    icon: Square,
  },
  {
    key: "tiktok",
    label: "TikTok / Reels",
    platform: "TikTok",
    ratio: "9:16",
    description: "Vertical short-form",
    icon: MonitorPlay,
  },
  {
    key: "instagram_post",
    label: "Instagram Post",
    platform: "Instagram",
    ratio: "4:5",
    description: "Feed portrait",
    icon: ImageIcon,
  },
  {
    key: "instagram_story",
    label: "Instagram Story",
    platform: "Instagram",
    ratio: "9:16",
    description: "Story format",
    icon: ImageIcon,
  },
  {
    key: "youtube_thumbnail",
    label: "YouTube Thumb",
    platform: "YouTube",
    ratio: "16:9",
    description: "Wide thumbnail",
    icon: Clapperboard,
  },
  {
    key: "youtube_shorts",
    label: "YouTube Shorts",
    platform: "YouTube",
    ratio: "9:16",
    description: "Vertical shorts",
    icon: Clapperboard,
  },
];

const quickPrompts = [
  {
    label: "Creator ad",
    icon: MonitorPlay,
    format: "tiktok" as OutputFormatKey,
    prompt:
      "Create a cinematic vertical creator ad for a premium fitness brand, confident female creator, luxury atmosphere, strong social media hook, polished commercial lighting, high-end campaign look.",
  },
  {
    label: "Luxury portrait",
    icon: UserRound,
    format: "instagram_post" as OutputFormatKey,
    prompt:
      "Create a premium editorial portrait of a confident creator with long red hair, realistic skin texture, cinematic golden lighting, elegant fashion styling, high-end social media campaign aesthetic.",
  },
  {
    label: "Product campaign",
    icon: ImageIcon,
    format: "square" as OutputFormatKey,
    prompt:
      "Create a premium product campaign visual with luxury lighting, clean composition, modern creator-brand aesthetic, high contrast, elegant commercial photography, no text, no logo.",
  },
  {
    label: "Ad concept",
    icon: Megaphone,
    format: "instagram_story" as OutputFormatKey,
    prompt:
      "Create a premium social media campaign visual with a strong visual hook, modern creator-brand aesthetic, luxury lighting and high-end commercial quality.",
  },
  {
    label: "Research style",
    icon: Search,
    format: "square" as OutputFormatKey,
    prompt:
      "Create a visual concept inspired by high-performing creator ads: strong composition, clear subject focus, premium commercial style and polished social media campaign quality.",
  },
];

const examplePrompts = [
  "Create a premium fitness creator campaign for Instagram...",
  "Create a cinematic product ad with luxury lighting...",
  "Create a TikTok-ready vertical creator visual...",
  "Create a high-end beauty campaign image...",
  "Create a YouTube thumbnail concept without text...",
];

function buildAgentPrompt(prompt: string, mode: AgentMode) {
  if (mode === "portrait") {
    return `
Mode: creator portrait.

Create a premium creator portrait based on this request:
${prompt}

Focus on realistic facial detail, elegant styling, editorial lighting, social-media-ready framing and premium campaign quality.
    `.trim();
  }

  if (mode === "product") {
    return `
Mode: product / brand visual.

Create a premium product or brand campaign visual based on this request:
${prompt}

Focus on commercial quality, elegant composition, clean lighting, product clarity and high-end advertising aesthetics.
    `.trim();
  }

  if (mode === "campaign") {
    return `
Mode: social media campaign.

Create a cinematic campaign visual based on this request:
${prompt}

Focus on a strong hook, modern creator-brand aesthetics, premium social media composition and high conversion visual appeal.
    `.trim();
  }

  return prompt.trim();
}

export default function AiAgentStudio({
  charactersRefreshKey = 0,
  regenerateDraft = null,
  onGenerationQueued,
  onClearRegenerateDraft,
  onOpenGallery,
}: AiAgentStudioProps) {
  const { copy, format } = useDashboardLanguage();
  const a = copy.agent;
  const supabase = createClient();

  const imageModes = useMemo(
    () => [
      {
        key: "standard" as const,
        label: a.imageModes.standard.label,
        description: a.imageModes.standard.description,
        status: "live" as const,
        icon: ImageIcon,
      },
      {
        key: "fast_draft" as const,
        label: a.imageModes.fastDraft.label,
        description: a.imageModes.fastDraft.description,
        status: "planned" as const,
        icon: Zap,
      },
      {
        key: "premium" as const,
        label: a.imageModes.premium.label,
        description: a.imageModes.premium.description,
        status: "planned" as const,
        icon: Sparkles,
      },
      {
        key: "reference_edit" as const,
        label: a.imageModes.referenceEdit.label,
        description: a.imageModes.referenceEdit.description,
        status: "planned" as const,
        icon: PenLine,
      },
    ],
    [a]
  );

  const localizedOutputFormats = useMemo(
    () =>
      outputFormats.map((formatOption) => ({
        ...formatOption,
        label: a.formats[formatOption.key].label,
        platform: a.formats[formatOption.key].platform,
        description: a.formats[formatOption.key].description,
      })),
    [a]
  );

  const formRef = useRef<HTMLFormElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [prompt, setPrompt] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [workflow] = useState<Workflow>("standard");
  /** UI-only architecture prep — not sent to /api/generate (workflow stays standard). */
  const [imageMode, setImageMode] = useState<ImageModeKey>("standard");
  const [agentMode, setAgentMode] = useState<AgentMode>("auto");
  const [outputFormatKey, setOutputFormatKey] =
    useState<OutputFormatKey>("square");
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);

  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [queuing, setQueuing] = useState(false);
  const [queuedGenerationId, setQueuedGenerationId] = useState<string | null>(
    null
  );

  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [exampleIndex, setExampleIndex] = useState(0);
  const [typedExample, setTypedExample] = useState("");

  const selectedCharacter = useMemo(() => {
    return characters.find((character) => character.id === selectedCharacterId);
  }, [characters, selectedCharacterId]);

  const selectedOutputFormat = useMemo(() => {
    return (
      localizedOutputFormats.find((format) => format.key === outputFormatKey) ??
      localizedOutputFormats[0]
    );
  }, [outputFormatKey, localizedOutputFormats]);

  const resultStatusLabel =
    agentResult?.status === "processing"
      ? copy.gallery.processing
      : agentResult?.status === "completed"
        ? copy.gallery.completed
        : agentResult?.status === "failed"
          ? copy.gallery.failed
          : "—";

  const resultStatusDescription =
    agentResult?.status === "processing"
      ? a.processingHint
      : agentResult?.status === "completed"
        ? a.completed
        : agentResult?.status === "failed"
          ? a.failed
          : "";

  useEffect(() => {
    loadCharacters();
  }, [charactersRefreshKey]);

  useEffect(() => {
    if (!regenerateDraft) return;

    setPrompt(regenerateDraft.prompt);
    setSelectedCharacterId(regenerateDraft.characterId ?? "");
    setQueuedGenerationId(null);
    setAgentResult(null);
    setErrorMessage(null);
    setStatusMessage(a.promptLoadedRegeneration);
  }, [regenerateDraft]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % examplePrompts.length);
    }, 4400);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentText = examplePrompts[exampleIndex];
    let charIndex = 0;

    setTypedExample("");

    const typing = window.setInterval(() => {
      charIndex += 1;
      setTypedExample(currentText.slice(0, charIndex));

      if (charIndex >= currentText.length) {
        window.clearInterval(typing);
      }
    }, 24);

    return () => window.clearInterval(typing);
  }, [exampleIndex]);

  useEffect(() => {
    if (!queuedGenerationId) return;

    let cancelled = false;
    let intervalId: number | null = null;

    async function pollGeneration() {
      try {
        const token = await getAccessToken();

        if (!token || cancelled) return;

        const response = await fetch("/api/generations?limit=24&offset=0", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || cancelled) return;

        const generations = data.generations ?? [];

        const found = generations.find(
          (generation: AgentResult) => generation.id === queuedGenerationId
        );

        if (!found) return;

        setAgentResult({
          id: found.id,
          prompt: found.prompt,
          image_url: found.image_url,
          status: found.status,
          error_message: found.error_message,
          output_format: found.output_format,
          image_size: found.image_size,
        });

        if (found.status === "completed" || found.status === "failed") {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Agent result polling error:", error);
      }
    }

    pollGeneration();
    intervalId = window.setInterval(pollGeneration, 2500);

    return () => {
      cancelled = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [queuedGenerationId]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadCharacters() {
    try {
      setLoadingCharacters(true);

      const token = await getAccessToken();

      if (!token) return;

      const response = await fetch("/api/characters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Agent character API error:", data.error);
        return;
      }

      setCharacters(data.characters || []);
    } catch (error) {
      console.error("Agent character load error:", error);
    } finally {
      setLoadingCharacters(false);
    }
  }

  function insertQuickPrompt(value: string, format?: OutputFormatKey) {
    setPrompt((current) => {
      if (!current.trim()) return value;
      return `${current.trim()}\n\n${value}`;
    });

    if (format) {
      setOutputFormatKey(format);
    }
  }

  function scrollToResult() {
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  }

  function submitFromTextarea(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();

    if (!queuing) {
      formRef.current?.requestSubmit();
    }
  }

  function getSafeErrorMessage(status: number, apiError?: string) {
    if (status === 401) return a.signInAgain;
    if (status === 402) return a.notEnoughCredits;
    if (status === 404) return a.profileNotFound;
    if (status === 400) return apiError || a.describePrompt;

    return apiError || a.queueFailed;
  }

  async function queueGeneration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setErrorMessage(a.describePrompt);
      return;
    }

    const temporaryGenerationId = `temp-${Date.now()}`;

    try {
      setQueuing(true);
      setQueuedGenerationId(null);
      setErrorMessage(null);
      setStatusMessage(
        selectedCharacter
          ? format(a.preparingWithProfile, { name: selectedCharacter.name })
          : format(a.preparingFormat, {
              format: selectedOutputFormat.label,
              ratio: selectedOutputFormat.ratio,
            })
      );

      setAgentResult({
        id: temporaryGenerationId,
        prompt: cleanPrompt,
        image_url: null,
        status: "processing",
        error_message: null,
        output_format: selectedOutputFormat.label,
        image_size: "",
      });

      scrollToResult();

      const token = await getAccessToken();

      if (!token) {
        setAgentResult({
          id: temporaryGenerationId,
          prompt: cleanPrompt,
          image_url: null,
          status: "failed",
          error_message: "Please sign in again.",
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        setErrorMessage(a.signInAgain);
        return;
      }

      const agentPrompt = buildAgentPrompt(cleanPrompt, agentMode);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: agentPrompt,
          characterId: selectedCharacterId || null,
          workflow,
          outputFormat: outputFormatKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const safeMessage = getSafeErrorMessage(response.status, data.error);

        setAgentResult({
          id: temporaryGenerationId,
          prompt: cleanPrompt,
          image_url: null,
          status: "failed",
          error_message: safeMessage,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        setErrorMessage(safeMessage);
        return;
      }

      const generationId =
        typeof data.generationId === "string" ? data.generationId : null;

      if (!generationId) {
        setAgentResult({
          id: temporaryGenerationId,
          prompt: cleanPrompt,
          image_url: null,
          status: "failed",
          error_message: "Generation was queued, but no generation ID returned.",
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        setErrorMessage(a.noGenerationId);
        return;
      }

      setQueuedGenerationId(generationId);

      setAgentResult((current) => ({
        id: generationId,
        prompt: current?.prompt ?? cleanPrompt,
        image_url: null,
        status: "processing",
        error_message: null,
        output_format: selectedOutputFormat.label,
        image_size: "",
      }));

      setStatusMessage(
        selectedCharacter
          ? format(a.queuedWithProfile, { name: selectedCharacter.name })
          : format(a.preparingFormat, {
              format: selectedOutputFormat.label,
              ratio: selectedOutputFormat.ratio,
            })
      );

      setPrompt("");
      setAgentMode("auto");
      onClearRegenerateDraft?.();
      onGenerationQueued?.();
      scrollToResult();
    } catch (error) {
      console.error("Agent queue error:", error);

      setAgentResult({
        id: temporaryGenerationId,
        prompt: cleanPrompt,
        image_url: null,
        status: "failed",
        error_message: "Network error. Please try again.",
        output_format: selectedOutputFormat.label,
        image_size: "",
      });

      setErrorMessage(a.networkError);
    } finally {
      setQueuing(false);
    }
  }

  const FormatIcon = selectedOutputFormat.icon;

  return (
    <section
      id="agent"
      className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#06060a] px-3 pb-28 pt-[4.75rem] sm:px-6 sm:pb-16 sm:pt-10 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="agent-film-bg absolute inset-0 overflow-hidden" />
        <div className="agent-film-noise absolute inset-0" />

        <motion.div
          className="absolute left-1/2 top-[66%] h-[38rem] w-[80rem] -translate-x-1/2 rounded-[100%] bg-[#d8ad5f]/22 blur-[120px]"
          animate={{
            x: ["-50%", "-48%", "-52%", "-50%"],
            scale: [1, 1.08, 0.98, 1],
            opacity: [0.3, 0.62, 0.38, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute left-[10%] bottom-[8%] h-[28rem] w-[28rem] rounded-full bg-white/12 blur-[120px]"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -55, 30, 0],
            opacity: [0.16, 0.36, 0.2, 0.16],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-[12%] bottom-[18%] h-[28rem] w-[28rem] rounded-full bg-[#d8ad5f]/18 blur-[120px]"
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 35, -25, 0],
            opacity: [0.2, 0.48, 0.28, 0.2],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,6,10,0.92)_0%,rgba(6,6,10,0.68)_36%,rgba(38,30,36,0.34)_60%,rgba(18,15,24,0.72)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col items-center justify-start py-4 sm:py-8 lg:min-h-[calc(100dvh-5rem)] lg:justify-center lg:py-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold text-white/45"
        >
          InfluExAi Agent
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-3 text-center text-2xl font-black tracking-[-0.055em] text-white sm:text-3xl lg:text-5xl"
        >
          {a.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xs leading-6 text-white/50 sm:text-sm"
        >
          {a.subtitle}
        </motion.p>

        {statusMessage && (
          <div className="mt-6 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <motion.form
          ref={formRef}
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          onSubmit={queueGeneration}
          className="relative isolate mt-6 w-full max-w-5xl overflow-visible rounded-[1.35rem] border border-white/12 bg-white/[0.075] shadow-[0_30px_110px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:mt-8 sm:rounded-[1.7rem]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_100%,rgba(216,173,95,0.16),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_38%)]" />

          <div className="relative z-10">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={submitFromTextarea}
              placeholder={
                typedExample || a.promptPlaceholder
              }
              className="min-h-[104px] w-full resize-y bg-transparent px-4 py-4 text-base leading-relaxed text-white outline-none placeholder:text-white/32 sm:min-h-[78px] sm:resize-none sm:px-6 sm:py-5 sm:text-lg"
            />

            <p className="border-t border-white/10 px-4 py-2 text-[11px] font-medium text-white/35 sm:px-6">
              {a.enterHint}
            </p>

            <div className="border-t border-white/10 px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex flex-col gap-3">
                <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <legend className="px-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    {a.imageMode}
                  </legend>

                  <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2 px-0.5">
                    <p className="min-w-0 max-w-md text-[10px] leading-4 text-white/30">
                      {a.imageModeIntro}
                    </p>
                    <p
                      className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-white/25"
                      title={a.plannedExpansion}
                    >
                      {a.plannedExpansion}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {imageModes.map((mode) => {
                      const Icon = mode.icon;
                      const isLive = mode.status === "live";
                      const isSelected = isLive && imageMode === mode.key;

                      return (
                        <button
                          key={mode.key}
                          type="button"
                          disabled={!isLive}
                          aria-pressed={isSelected}
                          aria-disabled={!isLive}
                          tabIndex={isLive ? 0 : -1}
                          onClick={() => {
                            if (isLive) setImageMode(mode.key);
                          }}
                          title={
                            isLive
                              ? mode.description
                              : `${mode.description} ${a.imageModes.plannedTooltip}`
                          }
                          className={`relative flex min-h-[5.5rem] flex-col rounded-xl border p-2.5 text-left transition sm:min-h-[6rem] sm:p-3 ${
                            isLive
                              ? isSelected
                                ? "border-[#d8ad5f]/50 bg-[#d8ad5f]/12 ring-1 ring-[#d8ad5f]/30"
                                : "border-white/10 bg-white/[0.04] hover:border-[#d8ad5f]/30 hover:bg-white/[0.06]"
                              : "pointer-events-none cursor-not-allowed border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent opacity-70"
                          }`}
                        >
                          {!isLive && (
                            <div
                              className="pointer-events-none absolute inset-0 rounded-xl bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(255,255,255,0.02)_6px,rgba(255,255,255,0.02)_12px)]"
                              aria-hidden
                            />
                          )}

                          <div className="relative flex items-start justify-between gap-2">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-[#d8ad5f] text-black"
                                  : "bg-white/[0.06] text-white/55"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${
                                isLive
                                  ? "bg-emerald-500/15 text-emerald-200"
                                  : "border border-white/10 bg-white/[0.04] text-white/40"
                              }`}
                            >
                              {isLive ? a.imageModes.live : a.imageModes.planned}
                            </span>
                          </div>

                          <p
                            className={`relative mt-2 text-xs font-black leading-tight ${
                              isLive ? "text-white" : "text-white/50"
                            }`}
                          >
                            {mode.label}
                          </p>

                          <p className="relative mt-1 line-clamp-3 flex-1 text-[10px] leading-4 text-white/38">
                            {mode.description}
                          </p>

                          {!isLive && (
                            <Lock
                              className="relative mt-1.5 h-3 w-3 text-white/20"
                              aria-hidden
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-bold text-white/65">
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>{a.agent}</span>
                  </div>

                  <select
                    value={selectedCharacterId}
                    onChange={(event) => {
                      setSelectedCharacterId(event.target.value);
                    }}
                    aria-label={a.styleProfileAria}
                    className="max-w-full rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none sm:max-w-[280px]"
                  >
                    <option value="">
                      {loadingCharacters
                        ? a.loadingStyleProfiles
                        : a.styleProfileNone}
                    </option>

                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFormatMenuOpen((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white transition hover:border-white/20"
                    >
                      <FormatIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{a.socialFormat}</span>
                      <span className="shrink-0 text-white/40">
                        {selectedOutputFormat.ratio}
                      </span>
                    </button>

                    {formatMenuOpen && (
                      <div className="absolute left-0 right-0 top-12 z-50 max-h-[min(60vh,320px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#101014] p-1.5 shadow-2xl sm:right-auto sm:w-64">
                        <div className="space-y-1">
                          {localizedOutputFormats.map((format) => {
                            const Icon = format.icon;
                            const active = outputFormatKey === format.key;

                            return (
                              <button
                                key={format.key}
                                type="button"
                                onClick={() => {
                                  setOutputFormatKey(format.key);
                                  setFormatMenuOpen(false);
                                }}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  active
                                    ? "bg-white text-black"
                                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <Icon className="h-3.5 w-3.5 shrink-0" />

                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-black">
                                      {format.label}
                                    </span>
                                    <span
                                      className={`block truncate text-[11px] ${
                                        active
                                          ? "text-black/55"
                                          : "text-white/35"
                                      }`}
                                    >
                                      {format.platform}
                                    </span>
                                  </span>
                                </span>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                                    active
                                      ? "bg-black/10 text-black"
                                      : "bg-white/[0.06] text-white/55"
                                  }`}
                                >
                                  {format.ratio}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-full bg-[#d8ad5f] px-3 py-2 text-xs font-black text-black">
                    {selectedCharacter ? a.styleProfile : a.standard}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {agentModes.map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setAgentMode(mode.key)}
                        className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 ${
                          agentMode === mode.key
                            ? "bg-white text-black"
                            : "border border-white/10 bg-black/25 text-white/55"
                        }`}
                        title={a.modes[mode.key].description}
                      >
                        {a.modes[mode.key].label}
                      </button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={queuing}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-white text-black shadow-xl transition hover:bg-white/85 disabled:opacity-50 sm:self-auto"
                  >
                    {queuing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.form>

        <div ref={resultRef} className="mt-6 w-full max-w-5xl scroll-mt-24 sm:mt-8 sm:scroll-mt-28">
          {agentResult && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.06] shadow-[0_30px_110px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[1.7rem]"
            >
              <div className="border-b border-white/10 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
                      {a.latestResult}
                    </p>

                    <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                      {agentResult.status === "processing"
                        ? a.generating
                        : agentResult.status === "completed"
                          ? a.completed
                          : a.failed}
                    </h3>

                    <p className="mt-2 text-sm text-white/45">
                      {resultStatusDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-bold text-white/55">
                      {agentResult.output_format ?? selectedOutputFormat.label}
                    </span>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
                        agentResult.status === "completed"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                          : agentResult.status === "failed"
                            ? "border-red-500/20 bg-red-500/10 text-red-200"
                            : "border-[#d8ad5f]/25 bg-[#d8ad5f]/10 text-[#d8ad5f]"
                      }`}
                    >
                      {agentResult.status === "processing" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}

                      {agentResult.status === "completed" && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}

                      {agentResult.status === "failed" && (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}

                      {resultStatusLabel}
                    </span>
                  </div>
                </div>

                {agentResult.status === "processing" && (
                  <div className="mt-5">
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div
                        className="h-full rounded-full bg-[#d8ad5f]"
                        initial={{ width: "12%" }}
                        animate={{ width: ["12%", "68%", "42%", "88%"] }}
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-xs font-bold leading-5 text-white/40">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {a.processingHint}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                <div className="relative flex min-h-[min(320px,50dvh)] items-center justify-center bg-black/45 sm:min-h-[420px]">
                  {agentResult.status === "processing" && (
                    <div className="flex w-full max-w-md flex-col items-center justify-center gap-5 p-10 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-[#d8ad5f]/30 blur-2xl" />

                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#d8ad5f]/25 bg-[#d8ad5f]/10">
                          <Loader2 className="h-9 w-9 animate-spin text-[#d8ad5f]" />
                        </div>
                      </div>

                      <div>
                        <p className="text-lg font-black text-white">
                          {a.generating}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                          {a.processingStay}
                        </p>
                      </div>

                      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                          {a.currentJob}
                        </p>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                          {agentResult.prompt}
                        </p>
                      </div>
                    </div>
                  )}

                  {agentResult.status === "failed" && (
                    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                      <AlertCircle className="h-12 w-12 text-red-200" />

                      <p className="text-sm font-bold text-red-100">
                        {a.failed}
                      </p>

                      <p className="max-w-md text-xs leading-6 text-red-100/60">
                        {agentResult.error_message ?? copy.gallery.unknownError}
                      </p>
                    </div>
                  )}

                  {agentResult.status === "completed" &&
                    agentResult.image_url && (
                      <img
                        src={agentResult.image_url}
                        alt={agentResult.prompt}
                        className="max-h-[640px] w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}

                  {agentResult.status === "completed" &&
                    !agentResult.image_url && (
                      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                        <ImageOff className="h-12 w-12 text-white/45" />

                        <p className="text-sm font-bold text-white">
                          {a.imageUrlMissing}
                        </p>
                      </div>
                    )}
                </div>

                <aside className="flex flex-col justify-between gap-5 border-t border-white/10 p-4 sm:gap-6 sm:p-5 lg:border-l lg:border-t-0 lg:min-h-[280px]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
                      {copy.gallery.prompt}
                    </p>

                    <p className="mt-3 line-clamp-6 text-sm leading-6 text-white/65">
                      {agentResult.prompt}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-1">
                    {agentResult.image_url && (
                      <a
                        href={agentResult.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {a.openImage}
                      </a>
                    )}

                    {agentResult.status === "completed" && (
                      <button
                        type="button"
                        onClick={onOpenGallery}
                        className="inline-flex items-center justify-center rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-5 py-3 text-sm font-bold text-[#d8ad5f] transition hover:bg-[#d8ad5f]/15"
                      >
                        <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                        {a.viewInGallery}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setQueuedGenerationId(null);
                        setAgentResult(null);
                        setStatusMessage(null);
                        setErrorMessage(null);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/70 transition hover:border-white/20 hover:text-white"
                    >
                      {a.createAnother}
                    </button>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-5 flex w-full max-w-4xl flex-wrap justify-center gap-2 px-1 sm:gap-3"
        >
          {quickPrompts.slice(0, 4).map((quickPrompt) => {
            const Icon = quickPrompt.icon;

            return (
              <motion.button
                key={quickPrompt.label}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() =>
                  insertQuickPrompt(quickPrompt.prompt, quickPrompt.format)
                }
                className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-3 py-2 text-xs font-bold text-white/68 transition hover:border-[#d8ad5f]/35 hover:text-[#d8ad5f] sm:px-4 sm:py-2.5"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{quickPrompt.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-6 flex max-w-3xl items-center justify-center gap-2 text-center text-xs text-white/28"
        >
          <Wand2 className="h-3.5 w-3.5 shrink-0" />
          <span>
            {a.styleProfilesFooter}
          </span>
        </motion.div>
      </div>

      <style jsx global>{`
        .agent-film-bg {
          background:
            radial-gradient(circle at 50% 100%, rgba(216, 173, 95, 0.38), transparent 34%),
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.16), transparent 30%),
            radial-gradient(circle at 0% 55%, rgba(216, 173, 95, 0.22), transparent 32%),
            radial-gradient(circle at 100% 55%, rgba(255, 255, 255, 0.12), transparent 34%),
            radial-gradient(circle at 42% 78%, rgba(93, 72, 255, 0.22), transparent 38%),
            linear-gradient(to bottom, #07070a 0%, #111014 40%, #2b2131 65%, #13103d 100%);
          filter: saturate(1.25);
          animation: agentBaseGlow 14s ease-in-out infinite alternate;
        }

        .agent-film-noise {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, transparent, black 38%, black 100%);
          opacity: 0.14;
          animation: agentGridDrift 18s linear infinite;
        }

        @keyframes agentBaseGlow {
          0% {
            transform: scale(1.05);
            filter: saturate(1.1) hue-rotate(0deg);
            opacity: 0.78;
          }

          50% {
            transform: scale(1.11);
            filter: saturate(1.35) hue-rotate(5deg);
            opacity: 1;
          }

          100% {
            transform: scale(1.08);
            filter: saturate(1.22) hue-rotate(-4deg);
            opacity: 0.86;
          }
        }

        @keyframes agentGridDrift {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 72px 72px;
          }
        }
      `}</style>
    </section>
  );
}