"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  Heart,
} from "lucide-react";

import toast from "react-hot-toast";

import { supabase } from "../lib/supabase";

type Character = {
  id: string;
  name: string;
};

type Generation = {
  id: string;
  prompt: string;
  image_url: string;
  model: string;
  created_at: string;
  character_id: string | null;
  favorite: boolean;

  characters?: Character | null;
};

function isValidGalleryUrl(
  url: unknown
): url is string {
  return (
    typeof url === "string" &&
    url.trim().length > 0 &&
    url.startsWith("https://")
  );
}

export default function GenerationGallery() {

  const pathname = usePathname();

  const [generations,
    setGenerations] =
    useState<Generation[]>([]);

  const [loading,
    setLoading] =
    useState(true);

  const [showFavorites,
    setShowFavorites] =
    useState(false);

  const loadGenerations = useCallback(
    async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("GALLERY USER:", user?.id ?? null);

      if (!user) {
        setGenerations([]);
        setLoading(false);
        return;
      }

      let data: Generation[] | null = null;
      let error: { message: string } | null = null;

      const withCharacters = await supabase
        .from("generations")
        .select(`
          *,
          characters (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      data = withCharacters.data as Generation[] | null;
      error = withCharacters.error;

      if (error) {
        console.log("GALLERY ERROR (with join):", error);

        const fallback = await supabase
          .from("generations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        data = fallback.data as Generation[] | null;
        error = fallback.error;
      }

      console.log("GALLERY DATA:", data);
      console.log("GALLERY ERROR:", error);

      if (error) {
        setGenerations([]);
        setLoading(false);
        return;
      }

      const valid = (data || []).filter(
        (generation) =>
          isValidGalleryUrl(
            generation.image_url
          )
      );

      console.log("VALID GENERATIONS:", valid);

      setGenerations(valid);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations, pathname]);

  useEffect(() => {
    function handleFocus() {
      if (pathname?.startsWith("/dashboard/gallery")) {
        loadGenerations();
      }
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadGenerations, pathname]);

  /*
    TOGGLE FAVORITE
  */

  async function toggleFavorite(
    generationId: string,
    current: boolean
  ) {

    const { error } =
      await supabase
        .from("generations")
        .update({
          favorite: !current,
        })
        .eq("id", generationId);

    if (error) {

      toast.error(
        "Failed to update favorite"
      );

      return;
    }

    setGenerations((prev) =>
      prev.map((generation) => {

        if (
          generation.id ===
          generationId
        ) {

          return {
            ...generation,
            favorite:
              !current,
          };
        }

        return generation;
      })
    );

    toast.success(
      current
        ? "Removed from favorites"
        : "Added to favorites"
    );
  }

  const filtered =
    showFavorites
      ? generations.filter(
          (generation) =>
            generation.favorite
        )
      : generations;

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-6 mb-14">

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
              CineAI Studio
            </p>

            <h1 className="text-6xl font-bold mb-6">
              Gallery
            </h1>

            <p className="text-gray-400 text-lg">
              Browse all generated cinematic AI images.
            </p>

          </div>

          {/* FILTER */}

          <button
            onClick={() =>
              setShowFavorites(
                !showFavorites
              )
            }

            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition ${
              showFavorites
                ? "bg-[#c7a36a] text-black"
                : "bg-[#080808] border border-[#1a1a1a] text-white"
            }`}
          >

            <Heart
              size={18}
              fill={
                showFavorites
                  ? "black"
                  : "transparent"
              }
            />

            {showFavorites
              ? "Showing Favorites"
              : "Show Favorites"}

          </button>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="text-gray-500">
            Loading generations...
          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          filtered.length === 0 && (

          <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-20 text-center text-gray-500">

            <p className="text-lg mb-2">
              No generations yet
            </p>

            <p className="text-sm text-gray-600">
              Generate images in the AI Generator and they will appear here.
            </p>

          </div>
        )}

        {/* GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {filtered.map(
            (generation) => (

              <div
                key={generation.id}

                className="bg-[#080808] border border-[#1a1a1a] rounded-3xl overflow-hidden hover:border-[#c7a36a] transition"
              >

                {/* IMAGE */}

                <Link
                  href={`/dashboard/gallery/${generation.id}`}
                >

                  <img
                    src={generation.image_url}
                    alt={generation.prompt}
                    className="w-full aspect-square object-cover cursor-pointer"
                  />

                </Link>

                {/* CONTENT */}

                <div className="p-6">

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4 mb-4">

                    <div>

                      {/* CHARACTER */}

                      {generation.characters && (

                        <p className="text-[#c7a36a] text-sm mb-3 uppercase tracking-[0.2em]">
                          {
                            generation
                              .characters
                              .name
                          }
                        </p>

                      )}

                      {/* PROMPT */}

                      <h2 className="text-lg font-semibold line-clamp-2">
                        {generation.prompt}
                      </h2>

                    </div>

                    {/* FAVORITE */}

                    <button
                      onClick={() =>
                        toggleFavorite(
                          generation.id,
                          !!generation.favorite
                        )
                      }

                      className="shrink-0"
                    >

                      <Heart
                        size={24}

                        className={
                          generation.favorite
                            ? "text-red-500 fill-red-500"
                            : "text-gray-500"
                        }
                      />

                    </button>

                  </div>

                  {/* META */}

                  <div className="flex items-center justify-between text-sm text-gray-500">

                    <span>
                      {generation.model}
                    </span>

                    <span>
                      {
                        new Date(
                          generation.created_at
                        ).toLocaleDateString()
                      }
                    </span>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}
