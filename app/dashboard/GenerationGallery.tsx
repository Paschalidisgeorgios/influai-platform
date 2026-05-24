"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import {
  Check,
  Copy,
  Download,
  Heart,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GenerationCharacter = {
  id: string;
  name: string;
} | null;

type Generation = {
  id: string;
  prompt: string;
  final_prompt: string | null;
  image_url: string;
  created_at: string;
  provider: string | null;
  model: string | null;
  is_favorite: boolean;
  character_id: string | null;
  ai_characters: GenerationCharacter;
};

type GenerationGalleryProps = {
  refreshKey?: number;
  onRegenerate?: (prompt: string, characterId: string | null) => void;
};

const PAGE_SIZE = 24;

const masonryBreakpoints = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  0: 2,
};

export default function GenerationGallery({
  refreshKey = 0,
  onRegenerate,
}: GenerationGalleryProps) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] =
    useState<Generation | null>(null);

  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [selectedCharacterId, setSelectedCharacterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const supabase = createClient();

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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    loadGenerations(0);
  }, [refreshKey, filter, selectedCharacterId, debouncedSearchQuery]);

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

    if (filter === "favorites") {
      params.set("favorite", "true");
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
      } else {
        setLoadingMore(true);
      }

      const token = await getAccessToken();

      if (!token) {
        throw new Error("No active session");
      }

      const response = await fetch(buildGenerationsUrl(offset), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load gallery");
      }

      const nextItems: Generation[] = data.generations || [];

      setGenerations((prev) =>
        offset === 0 ? nextItems : [...prev, ...nextItems]
      );

      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error) {
      console.error("Gallery load error:", error);
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
        throw new Error("Failed to update favorite");
      }

      setGenerations((prev) =>
        prev.map((item) =>
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
        throw new Error("Failed to delete generation");
      }

      setGenerations((prev) =>
        prev.filter((item) => item.id !== generationId)
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

  function Toolbar() {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search prompts..."
          className="w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white outline-none placeholder:text-white/35 focus:border-white/25"
        />

        <select
          value={selectedCharacterId}
          onChange={(event) => setSelectedCharacterId(event.target.value)}
          className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white outline-none focus:border-white/25"
        >
          <option value="all">All characters</option>
          <option value="free">Free prompts</option>

          {characterOptions.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-3 text-sm font-bold transition ${
              filter === "all"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.06] text-white"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("favorites")}
            className={`rounded-full px-5 py-3 text-sm font-bold transition ${
              filter === "favorites"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.06] text-white"
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
      <div className="py-20 text-center text-white/60">
        Loading gallery...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <Toolbar />

        {generations.length === 0 ? (
          <div className="py-20 text-center text-white/60">
            No matching generations.
          </div>
        ) : (
          <Masonry
            breakpointCols={masonryBreakpoints}
            className="flex gap-4"
            columnClassName="flex flex-col gap-4"
          >
            {generations.map((generation, index) => (
              <div
                key={generation.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]"
              >
                <div
                  className={`relative overflow-hidden ${
                    index % 5 === 0
                      ? "aspect-[3/4]"
                      : index % 3 === 0
                        ? "aspect-square"
                        : "aspect-[4/5]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleFavorite(generation.id, generation.is_favorite)
                    }
                    className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-xl transition hover:scale-105"
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
                    className="absolute left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-xl transition hover:scale-105"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGeneration(generation)}
                    className="relative block h-full w-full"
                  >
                    <Image
                      src={generation.image_url}
                      alt={generation.prompt}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  <p className="line-clamp-2 text-sm text-white/70">
                    {generation.prompt}
                  </p>

                  <div className="flex items-center justify-between gap-3 text-xs text-white/35">
                    <span>{generation.provider ?? "ai"}</span>
                    <span className="truncate">
                      {generation.ai_characters?.name ?? "free prompt"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSelectedGeneration(null)}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {copiedLabel && (
            <div className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-bold text-black shadow-2xl">
              <Check className="h-4 w-4" />
              {copiedLabel} copied
            </div>
          )}

          <div className="grid max-h-[92vh] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707] shadow-2xl lg:grid-cols-[1fr_420px]">
            <div className="relative min-h-[60vh] bg-black lg:min-h-[92vh]">
              <Image
                src={selectedGeneration.image_url}
                alt={selectedGeneration.prompt}
                fill
                sizes="80vw"
                className="object-contain"
                priority
              />
            </div>

            <aside className="flex flex-col justify-between gap-8 overflow-y-auto border-t border-white/10 p-6 lg:border-l lg:border-t-0">
              <div className="space-y-7">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/35">
                  <span>{selectedGeneration.provider ?? "ai"}</span>
                  <span>•</span>
                  <span>{selectedGeneration.model ?? "model"}</span>

                  {selectedGeneration.ai_characters?.name && (
                    <>
                      <span>•</span>
                      <span>{selectedGeneration.ai_characters.name}</span>
                    </>
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
                <button
                  type="button"
                  onClick={() => handleRegenerate(selectedGeneration)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/80"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </button>

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

                <button
                  type="button"
                  onClick={() => copyPrompt(selectedGeneration.prompt, "Prompt")}
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

                <a
                  href={selectedGeneration.image_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-white/25"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download image
                </a>

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