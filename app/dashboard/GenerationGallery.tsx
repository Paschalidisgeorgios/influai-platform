"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Heart,
  ImageOff,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GenerationCharacter = {
  id: string;
  name: string;
} | null;

type GenerationStatus = "processing" | "completed" | "failed";

type Generation = {
  id: string;
  prompt: string;
  final_prompt: string | null;
  image_url: string | null;
  created_at: string;
  provider: string | null;
  model: string | null;
  status: GenerationStatus;
  error_message: string | null;
  is_favorite: boolean;
  character_id: string | null;
  workflow?: string | null;
  social_platform?: string | null;
  output_format?: string | null;
  image_size?: string | null;
  output_width?: number | null;
  output_height?: number | null;
  credits_used?: number | null;
  ai_characters: GenerationCharacter;
};

type GenerationGalleryProps = {
  refreshKey?: number;
  onRegenerate?: (prompt: string, characterId: string | null) => void;
};

const PAGE_SIZE = 24;

function getStatusClass(status: GenerationStatus) {
  if (status === "completed") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "processing") {
    return "border-[#d8ad5f]/20 bg-[#d8ad5f]/10 text-[#d8ad5f]";
  }

  return "border-red-500/20 bg-red-500/10 text-red-200";
}

function getWorkflowLabel(workflow?: string | null) {
  if (!workflow || workflow === "standard" || workflow === "openai") {
    return "Standard";
  }

  return "Standard";
}

function getImageAspectClass(generation: Generation) {
  if (generation.image_size === "1024x1536") {
    return "aspect-[2/3]";
  }

  if (generation.image_size === "1536x1024") {
    return "aspect-[3/2]";
  }

  return "aspect-square";
}

export default function GenerationGallery({
  refreshKey = 0,
  onRegenerate,
}: GenerationGalleryProps) {
  const supabase = createClient();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] =
    useState<Generation | null>(null);

  const [favoriteFilter, setFavoriteFilter] = useState<"all" | "favorites">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "failed" | "processing"
  >("all");
  const [selectedCharacterId, setSelectedCharacterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const characterOptions = useMemo(() => {
    const map = new Map<string, string>();

    generations.forEach((generation) => {
      if (generation.ai_characters?.id && generation.ai_characters.name) {
        map.set(generation.ai_characters.id, generation.ai_characters.name);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [generations]);

  const hasProcessingItems = generations.some(
    (generation) => generation.status === "processing"
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    loadGenerations(0);
  }, [
    refreshKey,
    favoriteFilter,
    statusFilter,
    selectedCharacterId,
    debouncedSearchQuery,
  ]);

  useEffect(() => {
    if (!hasProcessingItems) return;

    const interval = window.setInterval(() => {
      loadGenerations(0);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [hasProcessingItems, refreshKey, favoriteFilter, statusFilter]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedGeneration(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!copiedLabel) return;

    const timeout = window.setTimeout(() => {
      setCopiedLabel(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [copiedLabel]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  function buildGenerationsUrl(offset: number) {
    const params = new URLSearchParams();

    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));

    if (favoriteFilter === "favorites") {
      params.set("favorite", "true");
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (selectedCharacterId !== "all") {
      params.set("characterId", selectedCharacterId);
    }

    if (debouncedSearchQuery.trim()) {
      params.set("search", debouncedSearchQuery.trim());
    }

    return `/api/generations?${params.toString()}`;
  }

  async function loadGenerations(offset: number) {
    try {
      if (offset === 0) {
        setLoading(true);
        setImageErrors({});
      } else {
        setLoadingMore(true);
      }

      const token = await getAccessToken();

      if (!token) {
        setGenerations([]);
        setHasMore(false);
        return;
      }

      const response = await fetch(buildGenerationsUrl(offset), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Generations API error:", {
          status: response.status,
          error: data.error,
        });

        if (offset === 0) {
          setGenerations([]);
        }

        setHasMore(false);
        return;
      }

      const nextItems: Generation[] = data.generations || [];

      setGenerations((current) =>
        offset === 0 ? nextItems : [...current, ...nextItems]
      );

      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error) {
      console.error("Gallery load error:", error);

      if (offset === 0) {
        setGenerations([]);
      }

      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function toggleFavorite(generationId: string, currentValue: boolean) {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch("/api/generations/favorite", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          generationId,
          isFavorite: !currentValue,
        }),
      });

      if (!response.ok) {
        console.error("Favorite update failed:", response.status);
        return;
      }

      setGenerations((current) =>
        current.map((item) =>
          item.id === generationId
            ? { ...item, is_favorite: !currentValue }
            : item
        )
      );

      setSelectedGeneration((current) =>
        current?.id === generationId
          ? { ...current, is_favorite: !currentValue }
          : current
      );
    } catch (error) {
      console.error("Favorite update error:", error);
    }
  }

  async function deleteGeneration(generationId: string) {
    try {
      const confirmed = window.confirm("Delete this generation permanently?");
      if (!confirmed) return;

      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch("/api/generations/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ generationId }),
      });

      if (!response.ok) {
        console.error("Delete generation failed:", response.status);
        return;
      }

      setGenerations((current) =>
        current.filter((item) => item.id !== generationId)
      );

      setSelectedGeneration((current) =>
        current?.id === generationId ? null : current
      );
    } catch (error) {
      console.error("Delete generation error:", error);
    }
  }

  async function copyPrompt(prompt: string, label: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedLabel(label);
    } catch (error) {
      console.error("Copy prompt error:", error);
    }
  }

  function handleRegenerate(generation: Generation) {
    onRegenerate?.(generation.prompt, generation.character_id);
    setSelectedGeneration(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function markImageError(generationId: string) {
    setImageErrors((current) => ({
      ...current,
      [generationId]: true,
    }));
  }

  function clearImageError(generationId: string) {
    setImageErrors((current) => {
      if (!current[generationId]) return current;

      const copy = { ...current };
      delete copy[generationId];
      return copy;
    });
  }

  function GenerationVisual({ generation }: { generation: Generation }) {
    if (generation.status === "processing") {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/[0.04] p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d8ad5f]" />
          <p className="text-sm font-bold text-white">Processing</p>
          <p className="line-clamp-3 text-xs text-white/45">
            Your image is being generated. The gallery refreshes automatically.
          </p>
        </div>
      );
    }

    if (generation.status === "failed") {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-red-500/10 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-200" />
          <p className="text-sm font-bold text-red-100">Generation failed</p>
          <p className="line-clamp-3 text-xs text-red-100/60">
            {generation.error_message ?? "Unknown error"}
          </p>
        </div>
      );
    }

    if (!generation.image_url) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/[0.04] p-6 text-center">
          <ImageOff className="h-8 w-8 text-white/50" />
          <p className="text-sm font-bold text-white">Image unavailable</p>
          <p className="line-clamp-3 text-xs text-white/40">
            This generation has no image URL.
          </p>
        </div>
      );
    }

    if (imageErrors[generation.id]) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-white/[0.04] p-6 text-center">
          <ImageOff className="h-8 w-8 text-white/50" />
          <div>
            <p className="text-sm font-bold text-white">Image could not load</p>
            <p className="mt-2 line-clamp-3 text-xs text-white/40">
              The file exists, but the gallery could not render it.
            </p>
          </div>

          <a
            href={generation.image_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-black"
            onClick={(event) => event.stopPropagation()}
          >
            Open image directly
          </a>
        </div>
      );
    }

    return (
      <img
        key={generation.image_url}
        src={generation.image_url}
        alt={generation.prompt}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => clearImageError(generation.id)}
        onError={() => markImageError(generation.id)}
      />
    );
  }

  function Toolbar() {
    return (
      <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-3 sm:space-y-4 sm:rounded-[2rem] sm:p-4">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search prompts..."
            className="w-full rounded-full border border-white/10 bg-black/25 px-5 py-3 text-sm font-medium text-white outline-none placeholder:text-white/35 focus:border-white/25"
          />

          <select
            value={selectedCharacterId}
            onChange={(event) => setSelectedCharacterId(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-white/25 sm:px-5 sm:py-3"
          >
            <option value="all">All style profiles</option>
            <option value="free">No style profile</option>

            {characterOptions.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {(
            [
              { key: "all", label: "All" },
              { key: "completed", label: "Completed" },
              { key: "processing", label: "Processing" },
              { key: "failed", label: "Failed" },
            ] as const
          ).map((status) => (
            <button
              key={status.key}
              type="button"
              onClick={() => setStatusFilter(status.key)}
              className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-5 sm:py-3 sm:text-sm ${
                statusFilter === status.key
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black/25 text-white"
              }`}
            >
              {status.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setFavoriteFilter((current) =>
                current === "favorites" ? "all" : "favorites"
              )
            }
            className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-5 sm:py-3 sm:text-sm ${
              favoriteFilter === "favorites"
                ? "bg-[#d8ad5f] text-black"
                : "border border-white/10 bg-black/25 text-white"
            }`}
          >
            Favorites
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] py-20 text-center text-white/60">
        Loading gallery...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <Toolbar />

        {generations.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] py-20 text-center text-white/60">
            No matching generations.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
            {generations.map((generation) => (
              <div
                key={generation.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_16px_50px_rgba(0,0,0,0.28)] sm:rounded-3xl"
              >
                <div
                  className={`relative overflow-hidden ${getImageAspectClass(
                    generation
                  )}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleFavorite(generation.id, generation.is_favorite)
                    }
                    className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 backdrop-blur-xl transition hover:scale-105 disabled:opacity-40"
                    disabled={generation.status !== "completed"}
                  >
                    <Heart
                      className={`h-5 w-5 transition ${
                        generation.is_favorite
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteGeneration(generation.id)}
                    className="absolute left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 backdrop-blur-xl transition hover:scale-105"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGeneration(generation)}
                    className="relative block h-full w-full"
                  >
                    <GenerationVisual generation={generation} />
                  </button>
                </div>

                <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusClass(
                        generation.status
                      )}`}
                    >
                      {generation.status}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      {getWorkflowLabel(generation.workflow)}
                    </span>

                    {(generation.output_format ||
                      generation.social_platform) && (
                      <span className="rounded-full border border-[#d8ad5f]/20 bg-[#d8ad5f]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#d8ad5f]">
                        {generation.output_format ??
                          generation.social_platform}
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-2 text-sm text-white/70">
                    {generation.prompt}
                  </p>

                  <div className="flex items-center justify-between gap-3 text-xs text-white/35">
                    <span>{generation.provider ?? generation.model ?? "model"}</span>
                    <span className="truncate">
                      {generation.ai_characters?.name ?? "no style profile"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => loadGenerations(generations.length)}
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {selectedGeneration && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/85 p-2 backdrop-blur-xl sm:items-center sm:p-4">
          <button
            type="button"
            onClick={() => setSelectedGeneration(null)}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-5 sm:top-5 sm:h-11 sm:w-11"
          >
            <X className="h-5 w-5" />
          </button>

          {copiedLabel && (
            <div className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-bold text-black shadow-2xl">
              <Check className="h-4 w-4" />
              {copiedLabel} copied
            </div>
          )}

          <div className="my-auto grid max-h-[min(95dvh,920px)] w-full max-w-7xl overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#070707] shadow-2xl sm:rounded-[2rem] lg:grid-cols-[1fr_420px]">
            <div className="relative min-h-[60vh] bg-black lg:min-h-[92vh]">
              {selectedGeneration.status === "processing" ? (
                <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 bg-white/[0.04] p-8 text-center lg:min-h-[92vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-[#d8ad5f]" />
                  <h3 className="text-2xl font-black text-white">
                    Generation in progress
                  </h3>
                  <p className="max-w-lg text-sm leading-7 text-white/50">
                    The gallery refreshes automatically while your image is
                    being created.
                  </p>
                </div>
              ) : selectedGeneration.status === "failed" ? (
                <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 bg-red-500/10 p-8 text-center lg:min-h-[92vh]">
                  <AlertCircle className="h-12 w-12 text-red-200" />
                  <h3 className="text-2xl font-black text-red-100">
                    Generation failed
                  </h3>
                  <p className="max-w-lg text-sm leading-7 text-red-100/60">
                    {selectedGeneration.error_message ?? "Unknown error"}
                  </p>
                </div>
              ) : selectedGeneration.image_url &&
                !imageErrors[selectedGeneration.id] ? (
                <img
                  src={selectedGeneration.image_url}
                  alt={selectedGeneration.prompt}
                  className="h-full max-h-[92vh] w-full object-contain"
                  referrerPolicy="no-referrer"
                  onLoad={() => clearImageError(selectedGeneration.id)}
                  onError={() => markImageError(selectedGeneration.id)}
                />
              ) : (
                <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 bg-white/[0.04] p-8 text-center lg:min-h-[92vh]">
                  <ImageOff className="h-12 w-12 text-white/50" />
                  <h3 className="text-2xl font-black text-white">
                    Image unavailable
                  </h3>
                  <p className="max-w-lg text-sm leading-7 text-white/50">
                    This generation has no valid image URL or could not be
                    rendered in the gallery.
                  </p>

                  {selectedGeneration.image_url && (
                    <a
                      href={selectedGeneration.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white px-5 py-3 text-sm font-black text-black"
                    >
                      Open image directly
                    </a>
                  )}
                </div>
              )}
            </div>

            <aside className="flex flex-col justify-between gap-8 overflow-y-auto border-t border-white/10 p-6 lg:border-l lg:border-t-0">
              <div className="space-y-7">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusClass(
                      selectedGeneration.status
                    )}`}
                  >
                    {selectedGeneration.status}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    {getWorkflowLabel(selectedGeneration.workflow)}
                  </span>

                  {selectedGeneration.output_format && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      {selectedGeneration.output_format}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.28em] text-white/40">
                    Prompt
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/75">
                    {selectedGeneration.prompt}
                  </p>
                </div>

                {selectedGeneration.error_message && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.28em] text-red-200/70">
                      Error
                    </h3>

                    <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs leading-6 text-red-100/70">
                      {selectedGeneration.error_message}
                    </p>
                  </div>
                )}

                {selectedGeneration.final_prompt && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.28em] text-white/40">
                      Final Prompt
                    </h3>

                    <p className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-white/55">
                      {selectedGeneration.final_prompt}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {selectedGeneration.status !== "processing" && (
                  <button
                    type="button"
                    onClick={() => handleRegenerate(selectedGeneration)}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/80"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </button>
                )}

                {selectedGeneration.status === "completed" && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleFavorite(
                        selectedGeneration.id,
                        selectedGeneration.is_favorite
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-white/25"
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${
                        selectedGeneration.is_favorite
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    {selectedGeneration.is_favorite
                      ? "Remove favorite"
                      : "Add favorite"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    copyPrompt(selectedGeneration.prompt, "Prompt")
                  }
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-white/25"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy prompt
                </button>

                {selectedGeneration.final_prompt && (
                  <button
                    type="button"
                    onClick={() =>
                      copyPrompt(
                        selectedGeneration.final_prompt ?? "",
                        "Final prompt"
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-white/25"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy final prompt
                  </button>
                )}

                {selectedGeneration.image_url && (
                  <a
                    href={selectedGeneration.image_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-white/25"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Open / download image
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => deleteGeneration(selectedGeneration.id)}
                  className="inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete generation
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}