"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clapperboard,
  ImageIcon,
  Loader2,
  Megaphone,
  MonitorPlay,
  Plus,
  Search,
  Send,
  Sparkles,
  Square,
  UserRound,
  Wand2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Character = {
  id: string;
  name: string;
  reference_image_url: string | null;
  face_workflow?: string | null;
  training_status?: string | null;
  trained_model_url?: string | null;
  trained_trigger_word?: string | null;
};

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
};

type Workflow = "standard";
type AgentMode = "auto" | "portrait" | "product" | "campaign";

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

type AiAgentStudioProps = {
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onGenerationQueued?: () => void;
  onClearRegenerateDraft?: () => void;
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
    description: "Best for creator portraits, editorials and people-focused visuals.",
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
}: AiAgentStudioProps) {
  const supabase = createClient();

  const [prompt, setPrompt] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [workflow] = useState<Workflow>("standard");
  const [agentMode, setAgentMode] = useState<AgentMode>("auto");
  const [outputFormatKey, setOutputFormatKey] =
    useState<OutputFormatKey>("square");
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);

  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [queuing, setQueuing] = useState(false);
  const [queuedGenerationId, setQueuedGenerationId] = useState<string | null>(
    null
  );

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [exampleIndex, setExampleIndex] = useState(0);
  const [typedExample, setTypedExample] = useState("");

  const selectedCharacter = useMemo(() => {
    return characters.find((character) => character.id === selectedCharacterId);
  }, [characters, selectedCharacterId]);

  const selectedOutputFormat = useMemo(() => {
    return (
      outputFormats.find((format) => format.key === outputFormatKey) ??
      outputFormats[0]
    );
  }, [outputFormatKey]);

  useEffect(() => {
    loadCharacters();
  }, [charactersRefreshKey]);

  useEffect(() => {
    if (!regenerateDraft) return;

    setPrompt(regenerateDraft.prompt);
    setSelectedCharacterId(regenerateDraft.characterId ?? "");
    setQueuedGenerationId(null);
    setErrorMessage(null);
    setStatusMessage("Prompt loaded for regeneration.");
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

  function getSafeErrorMessage(status: number, apiError?: string) {
    if (status === 401) return "Please sign in again.";
    if (status === 402) return "Not enough credits. Please buy more credits.";
    if (status === 404) return "Selected style profile was not found.";
    if (status === 400) return apiError || "Please check your prompt.";

    return apiError || "Failed to queue generation. Please try again.";
  }

  async function queueGeneration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setQueuing(true);
      setQueuedGenerationId(null);
      setErrorMessage(null);
      setStatusMessage(null);

      const cleanPrompt = prompt.trim();

      if (!cleanPrompt) {
        setErrorMessage("Please describe what you want to create.");
        return;
      }

      const token = await getAccessToken();

      if (!token) {
        setErrorMessage("Please sign in again.");
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
        setErrorMessage(getSafeErrorMessage(response.status, data.error));
        return;
      }

      setQueuedGenerationId(data.generationId ?? null);
      setStatusMessage(
        selectedCharacter
          ? `Generation queued using ${selectedCharacter.name} as style profile.`
          : `Generation queued for ${selectedOutputFormat.label} (${selectedOutputFormat.ratio}).`
      );
      setPrompt("");
      setAgentMode("auto");
      onClearRegenerateDraft?.();
      onGenerationQueued?.();
    } catch (error) {
      console.error("Agent queue error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setQueuing(false);
    }
  }

  const FormatIcon = selectedOutputFormat.icon;

  return (
    <section
      id="agent"
      className="relative h-screen min-h-screen overflow-hidden bg-[#06060a] px-4 py-6 sm:px-8 lg:px-10"
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

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
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
          className="mt-3 text-center text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl lg:text-5xl"
        >
          Create campaign-ready visuals
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xs leading-6 text-white/50 sm:text-sm"
        >
          Generate premium creator visuals, product shots and social media
          campaign assets. Use style profiles for reusable creative direction.
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
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          onSubmit={queueGeneration}
          className="relative isolate mt-8 w-full max-w-5xl overflow-visible rounded-[1.7rem] border border-white/12 bg-white/[0.075] shadow-[0_30px_110px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_100%,rgba(216,173,95,0.16),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_38%)]" />

          <div className="relative z-10">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={typedExample || "Describe the visual you want to create"}
              className="min-h-[78px] w-full resize-none bg-transparent px-5 py-5 text-base text-white outline-none placeholder:text-white/32 sm:px-6 sm:text-lg"
            />

            <div className="border-t border-white/10 px-3 py-4 sm:px-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-bold text-white/65">
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>Agent</span>
                  </div>

                  <select
                    value={selectedCharacterId}
                    onChange={(event) => {
                      setSelectedCharacterId(event.target.value);
                    }}
                    className="max-w-full rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none sm:max-w-[260px]"
                  >
                    <option value="">
                      {loadingCharacters
                        ? "Loading style profiles..."
                        : "No style profile"}
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
                      <span>Social Format</span>
                      <span className="shrink-0 text-white/40">
                        {selectedOutputFormat.ratio}
                      </span>
                    </button>

                    {formatMenuOpen && (
                      <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-white/10 bg-[#101014] p-1.5 shadow-2xl">
                        <div className="space-y-1">
                          {outputFormats.map((format) => {
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
                    {selectedCharacter ? "Character Style" : "Standard"}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {agentModes.map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setAgentMode(mode.key)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          agentMode === mode.key
                            ? "bg-white text-black"
                            : "border border-white/10 bg-black/25 text-white/55"
                        }`}
                        title={mode.description}
                      >
                        {mode.label}
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

        {queuedGenerationId && (
          <p className="mt-4 text-center text-xs text-white/40">
            Queued job: {queuedGenerationId}
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-5 flex max-w-4xl flex-wrap justify-center gap-3"
        >
          {quickPrompts.map((quickPrompt) => {
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-4 py-2.5 text-xs font-bold text-white/68 transition hover:border-white/22 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{quickPrompt.label}</span>
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
          Style profiles guide the look, mood and creative direction.
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