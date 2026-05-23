"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { supabase } from "../../lib/supabase";

import ResultsGrid from "../../components/generator/ResultsGrid";

import PromptEditor from "../../components/generator/PromptEditor";

import GeneratorControls from "../../components/generator/GeneratorControls";

import PromptInsights from "../../components/generator/PromptInsights";

import GenerationStatus from "../../components/generator/GenerationStatus";

import EmptyState from "../../components/generator/EmptyState";

import {
  buildConsistencyPrompt,
} from "../../lib/ai/characterConsistency";

import {
  updateCharacterMemory,
} from "../../lib/ai/updateCharacterMemory";

type Character = {
  id: string;
  name: string;
  reference_images: string[];

  dna?: string;

  visual_signature?: string;

  style_memory?: string;

  favorite_prompt_style?: string;
};

type GeneratedImage = {
  url: string;
  prompt: string;
};

function isValidImageUrl(
  url: unknown
): url is string {
  return (
    typeof url === "string" &&
    url.trim().length > 0 &&
    (url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:image/"))
  );
}

function sanitizePrompt(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed === "undefined" ||
    trimmed.startsWith("undefined")
  ) {
    return "";
  }

  return trimmed;
}

function normalizeApiImages(
  data: Record<string, unknown>
): string[] {
  const rawImages =
    data.images ??
    data.image ??
    data.output ??
    data.result ??
    data.data ??
    [];

  if (typeof rawImages === "string") {
    return isValidImageUrl(rawImages)
      ? [rawImages]
      : [];
  }

  if (!Array.isArray(rawImages)) {
    return [];
  }

  return rawImages
    .map((item: unknown) => {
      if (isValidImageUrl(item)) {
        return item;
      }

      if (
        item &&
        typeof item === "object"
      ) {
        const record = item as {
          url?: unknown;
          href?: unknown;
        };

        if (
          isValidImageUrl(
            record.url
          )
        ) {
          return record.url;
        }

        if (
          isValidImageUrl(
            record.href
          )
        ) {
          return record.href;
        }
      }

      return null;
    })
    .filter(isValidImageUrl);
}

const presets = [
  {
    title: "Luxury Editorial",
    prompt:
      "luxury editorial fashion photoshoot",
  },

  {
    title: "Fitness Influencer",
    prompt:
      "cinematic fitness influencer",
  },

  {
    title: "Dark Moody",
    prompt:
      "dark moody cinematic portrait",
  },

  {
    title: "Streetwear Campaign",
    prompt:
      "streetwear fashion campaign",
  },

  {
    title: "Luxury Lifestyle",
    prompt:
      "luxury lifestyle influencer",
  },

  {
    title: "Instagram Reel",
    prompt:
      "viral instagram reel aesthetic",
  },
];

const lightingOptions = [
  "Cinematic",
  "Golden Hour",
  "Dark Moody",
  "Studio Softbox",
  "Neon Night",
  "Natural Daylight",
];

const cameraAngles = [
  "Portrait",
  "Close Up",
  "Wide Shot",
  "Low Angle",
  "High Fashion",
  "Full Body",
];

const aspectRatios = [
  "1:1",
  "16:9",
  "9:16",
  "4:5",
];

const CREDIT_PLANS = [
  { id: "starter" as const, label: "Starter", credits: 50 },
  { id: "professional" as const, label: "Professional", credits: 150 },
  { id: "ultimate" as const, label: "Ultimate", credits: 300 },
];

export default function ImageGeneratorPage() {

  const router = useRouter();

  const [prompt, setPrompt] =
    useState("");

  const [enhancedPrompt,
    setEnhancedPrompt] =
    useState("");

  const [enhancementFallback,
    setEnhancementFallback] =
    useState(false);

  const [images, setImages] =
    useState<GeneratedImage[]>([]);

  const [loading,
    setLoading] =
    useState(false);

  const [generationStep,
    setGenerationStep] =
    useState("");

  const [characters,
    setCharacters] =
    useState<Character[]>([]);

  const [selectedCharacter,
    setSelectedCharacter] =
    useState<Character | null>(
      null
    );

  const [lighting,
    setLighting] =
    useState("Cinematic");

  const [cameraAngle,
    setCameraAngle] =
    useState("Portrait");

  const [aspectRatio,
    setAspectRatio] =
    useState("1:1");

  const [realism,
    setRealism] =
    useState(80);

  const [checkoutLoading,
    setCheckoutLoading] =
    useState<string | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const payment = params.get("payment");

    if (payment === "success") {
      toast.success(
        "Payment successful. Credits will be available shortly."
      );
      router.replace("/dashboard/image-generator");
    } else if (payment === "cancelled") {
      toast.error("Payment cancelled.");
      router.replace("/dashboard/image-generator");
    }
  }, [router]);

  async function startCheckout(
    plan: "starter" | "professional" | "ultimate"
  ) {
    try {
      setCheckoutLoading(plan);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        toast.error(
          typeof data?.error === "string"
            ? data.error
            : "Checkout failed"
        );
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function loadCharacters() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } =
      await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      return;
    }

    setCharacters(data || []);
  }

  function reusePrompt(
    prompt: string
  ) {

    setPrompt(prompt);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function createVariations() {

    setPrompt(
      `${prompt}, alternate cinematic variation, luxury editorial quality`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function generateImage() {

    if (!prompt) {

      toast.error(
        "Enter a prompt"
      );

      return;
    }

    try {

      setLoading(true);

      setEnhancedPrompt("");

      setEnhancementFallback(false);

      /*
        STEP 1
      */

      setGenerationStep(
        "Analyzing character DNA..."
      );

      /*
        CONSISTENCY
      */

      const consistencyPrompt =
        buildConsistencyPrompt({
          prompt: sanitizePrompt(prompt),
          dna: selectedCharacter?.dna,
          visualSignature:
            selectedCharacter?.visual_signature,
          styleMemory:
            selectedCharacter?.style_memory,
          favoritePromptStyle:
            selectedCharacter?.favorite_prompt_style,
        });

      if (!consistencyPrompt) {
        toast.error("Enter a valid prompt");
        setLoading(false);
        setGenerationStep("");
        return;
      }

      /*
        STEP 2
      */

      setGenerationStep(
        "Enhancing cinematic composition..."
      );

      /*
        PROMPT ENHANCEMENT
      */

      let safeEnhancedPrompt =
        consistencyPrompt;

      let usedFallback = false;

      try {
        const enhanceResponse =
          await fetch("/api/enhance-prompt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: consistencyPrompt,
              dna: selectedCharacter?.dna || "",
              lighting,
              cameraAngle,
            }),
          });

        const enhancedData =
          await enhanceResponse.json();

        const enhanced = sanitizePrompt(
          enhancedData?.enhanced
        );

        if (enhancedData?.fallback) {
          usedFallback = true;
        }

        if (enhanced) {
          safeEnhancedPrompt = enhanced;
        } else {
          usedFallback = true;
        }
      } catch {
        usedFallback = true;
      }

      setEnhancementFallback(usedFallback);

      setEnhancedPrompt(
        safeEnhancedPrompt
      );

      /*
        FINAL PROMPT
      */

      const finalPrompt = [
        safeEnhancedPrompt,
        `realism strength ${realism}%`,
        `aspect ratio ${aspectRatio}`,
        "8k editorial quality",
      ]
        .filter(Boolean)
        .join(", ");

      /*
        STEP 3
      */

      setGenerationStep(
        "Building visual consistency..."
      );

      /*
        SESSION
      */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Not authenticated");
        setLoading(false);
        setGenerationStep("");
        return;
      }

      if (!sanitizePrompt(finalPrompt)) {
        toast.error("Invalid prompt");
        setLoading(false);
        setGenerationStep("");
        return;
      }

      /*
        STEP 4
      */

      setGenerationStep(
        "Rendering cinematic frames..."
      );

      /*
        IMAGE GENERATION
      */

      const response =
        await fetch(
          "/api/image-generator",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              prompt:
                finalPrompt,

              characterId:
                selectedCharacter?.id || null,
            }),
          }
        );

      const data = await response.json();

      if (response.status === 402 && data.paymentRequired) {
        toast.error(
          "Free image used. Buy credits to continue."
        );
        return;
      }

      if (!response.ok) {
        toast.error(
          typeof data?.error === "string"
            ? data.error
            : "Generation failed"
        );
        return;
      }

      const normalized = normalizeApiImages(data);

      if (normalized.length === 0) {
        toast.error("No images returned");
        return;
      }

      const mapped: GeneratedImage[] =
        normalized.map((url) => ({
          url,
          prompt: finalPrompt,
        }));

      setImages(mapped);

      const savedCount =
        typeof data.savedCount === "number"
          ? data.savedCount
          : 0;

      const hasDbErrors =
        Array.isArray(data.dbErrors) &&
        data.dbErrors.length > 0;

      if (savedCount === 0 || hasDbErrors) {
        toast(
          "Images generated but not saved to gallery",
          { icon: "⚠️" }
        );
      }

      /*
        MEMORY LEARNING
      */

      if (selectedCharacter) {
        try {
          const updatedMemory =
            updateCharacterMemory({
              existingMemory:
                selectedCharacter.style_memory,
              newPrompt: finalPrompt,
            });

          const { error: memoryError } =
            await supabase
              .from("characters")
              .update({
                style_memory: updatedMemory,
              })
              .eq("id", selectedCharacter.id);

          if (memoryError) {
            // non-blocking
          }
        } catch {
          // non-blocking
        }
      }

      if (
        savedCount > 0 &&
        !hasDbErrors
      ) {
        toast.success("Images generated");
      }

    } catch {
      toast.error("Generation failed");

    } finally {

      setLoading(false);

      setGenerationStep("");
    }
  }

  return (

    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 text-white">

        <div className="mb-10 md:mb-14">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
            InfluAI
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Advanced AI Generator
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl">
            Create cinematic AI visuals with persistent character consistency.
          </p>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* LEFT */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-5 md:p-8">

            <div className="mb-8">

              <label className="block text-sm text-gray-400 mb-3">
                Character
              </label>

              <select
                value={
                  selectedCharacter?.id || ""
                }

                onChange={(e) => {

                  const character =
                    characters.find(
                      (c) =>
                        c.id ===
                        e.target.value
                    );

                  setSelectedCharacter(
                    character || null
                  );
                }}

                className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-4 py-4"
              >

                <option value="">
                  No Character
                </option>

                {characters.map(
                  (character) => (

                    <option
                      key={character.id}
                      value={character.id}
                    >
                      {character.name}
                    </option>

                  )
                )}

              </select>

            </div>

            <div className="mb-8 bg-[#1a140d]/40 border border-[#c7a36a]/20 rounded-3xl p-5 md:p-6">

              <p className="text-[#c7a36a] uppercase tracking-[0.2em] text-xs mb-2">
                Credits
              </p>

              <h3 className="text-lg font-bold mb-2">
                1 free image included
              </h3>

              <p className="text-sm text-gray-400 mb-5">
                Buy credits to continue generating. Each image costs 1 credit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {CREDIT_PLANS.map((plan) => (

                  <button
                    key={plan.id}
                    type="button"
                    disabled={!!checkoutLoading}
                    onClick={() =>
                      startCheckout(plan.id)
                    }
                    className="bg-black border border-[#1a1a1a] hover:border-[#c7a36a] rounded-2xl p-4 text-left transition disabled:opacity-50"
                  >

                    <p className="font-semibold text-[#c7a36a] mb-1">
                      {plan.label}
                    </p>

                    <p className="text-sm text-gray-400">
                      {plan.credits} credits
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      {checkoutLoading === plan.id
                        ? "Redirecting..."
                        : "Buy now"}
                    </p>

                  </button>

                ))}

              </div>

            </div>

            <GeneratorControls
              lighting={lighting}
              setLighting={setLighting}

              cameraAngle={cameraAngle}
              setCameraAngle={
                setCameraAngle
              }

              aspectRatio={aspectRatio}
              setAspectRatio={
                setAspectRatio
              }

              realism={realism}
              setRealism={
                setRealism
              }

              lightingOptions={
                lightingOptions
              }

              cameraAngles={
                cameraAngles
              }

              aspectRatios={
                aspectRatios
              }
            />

            <PromptEditor
              prompt={prompt}

              setPrompt={setPrompt}

              presets={presets}

              loading={loading}

              onGenerate={
                generateImage
              }
            />

          </div>

          {/* RIGHT */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-5 md:p-8">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Results
              </h2>

              <div className="bg-[#1a140d] text-[#c7a36a] text-sm px-4 py-2 rounded-full">
                FLUX
              </div>

            </div>

            {loading && (

              <GenerationStatus
                step={
                  generationStep
                }
              />

            )}

            {!loading && enhancedPrompt && (

              <PromptInsights
                originalPrompt={prompt}
                enhancedPrompt={
                  enhancedPrompt
                }
                hasCharacter={
                  !!selectedCharacter
                }
                enhancementFallback={
                  enhancementFallback
                }
              />

            )}

            {images.length === 0 && !loading && (
              <EmptyState />
            )}

            {images.length > 0 && (

              <ResultsGrid
                images={images}

                onReusePrompt={
                  reusePrompt
                }

                onCreateVariations={
                  createVariations
                }
              />

            )}

          </div>

        </div>

    </div>
  );
}