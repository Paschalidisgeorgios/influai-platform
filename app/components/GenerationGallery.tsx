"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  Heart,
  Sparkles,
  ImageIcon,
} from "lucide-react";

import toast from "react-hot-toast";

import { isHttpImageUrl } from "../lib/image-url";

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

type GalleryImage = {
  url: string;
  prompt: string;
};

type GalleryItem = Generation & {
  image: GalleryImage;
};

function mapGenerationToGalleryImage(
  generation: Generation
): GalleryImage | null {
  const rawUrl = generation.image_url;

  if (
    typeof rawUrl !== "string" ||
    !rawUrl.trim().startsWith("https://") ||
    !isHttpImageUrl(rawUrl)
  ) {
    return null;
  }

  return {
    url: rawUrl.trim(),
    prompt:
      typeof generation.prompt === "string"
        ? generation.prompt
        : "",
  };
}

function toGalleryItem(
  generation: Generation
): GalleryItem | null {
  const image = mapGenerationToGalleryImage(
    generation
  );

  if (!image) {
    return null;
  }

  return {
    ...generation,
    image,
  };
}

function GalleryCardImage({
  url,
}: {
  url: string;
}) {
  const [imageError, setImageError] =
    useState(false);

  if (imageError) {
    return (
      <div className="flex w-full aspect-[4/5] items-center justify-center bg-[#080808] text-sm text-gray-500">
        Image could not be displayed.
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Generated AI image"
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      className="block w-full aspect-[4/5] object-cover cursor-pointer bg-black"
    />
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
        console.error("GALLERY ERROR:", error.message);

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

      if (error) {
        console.error("GALLERY ERROR:", error.message);
        setGenerations([]);
        setLoading(false);
        return;
      }

      const valid = (data || []).filter(
        (generation) =>
          mapGenerationToGalleryImage(
            generation
          ) !== null
      );

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

  const galleryItems: GalleryItem[] =
  generations
    .map(toGalleryItem)
    .filter(
      (item): item is GalleryItem =>
        item !== null
    );

  const filtered =
    showFavorites
      ? galleryItems.filter(
          (item) =>
            item.favorite
        )
      : galleryItems;

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">

        <div className="flex flex-wrap items-center justify-between gap-6 mb-14">

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
              InfluAI
            </p>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Gallery
            </h1>

            <p className="text-gray-400 text-lg">
              Browse all generated cinematic AI images.
            </p>

          </div>

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

        {loading && (

          <div className="border border-[#1a1a1a] rounded-3xl p-16 text-center">

            <div className="w-12 h-12 rounded-full border-2 border-[#c7a36a] border-t-transparent animate-spin mx-auto mb-6" />

            <p className="text-gray-400">
              Loading your gallery...
            </p>

          </div>

        )}

        {!loading &&
          filtered.length === 0 && (

          <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-12 md:p-20 text-center">

            <div className="w-20 h-20 rounded-3xl bg-[#1a140d] flex items-center justify-center mx-auto mb-8">

              <ImageIcon
                className="text-[#c7a36a]"
                size={36}
              />

            </div>

            <h3 className="text-2xl font-bold mb-4">
              {showFavorites
                ? "No favorites yet"
                : "Your gallery is empty"}
            </h3>

            <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
              {showFavorites
                ? "Favorite images from your gallery to see them here."
                : "Generate cinematic images in the AI Generator. Every save appears here automatically."}
            </p>

            {!showFavorites && (

              <Link
                href="/dashboard/image-generator"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#c7a36a] text-black font-bold hover:opacity-90 transition"
              >
                <Sparkles size={18} />
                Open Image Generator
              </Link>

            )}

          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {filtered.map(
            (item) => (

              <div
                key={item.id}

                className="flex flex-col bg-[#080808] border border-[#1a1a1a] rounded-3xl hover:border-[#c7a36a] transition"
              >

                <Link
                  href={`/dashboard/gallery/${item.id}`}
                  className="block w-full shrink-0 bg-black"
                >

                  <GalleryCardImage
                    url={item.image.url}
                  />

                </Link>

                <div className="p-6">

                  <div className="flex items-start justify-between gap-4 mb-4">

                    <div className="min-w-0">

                      {item.characters && (

                        <p className="text-[#c7a36a] text-sm mb-3 uppercase tracking-[0.2em]">
                          {
                            item
                              .characters
                              .name
                          }
                        </p>

                      )}

                      <h2 className="text-lg font-semibold line-clamp-2 text-gray-200">
                        {item.image.prompt}
                      </h2>

                    </div>

                    <button
                      onClick={() =>
                        toggleFavorite(
                          item.id,
                          !!item.favorite
                        )
                      }

                      className="shrink-0"
                    >

                      <Heart
                        size={24}

                        className={
                          item.favorite
                            ? "text-red-500 fill-red-500"
                            : "text-gray-500"
                        }
                      />

                    </button>

                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">

                    <span>
                      {item.model}
                    </span>

                    <span>
                      {
                        new Date(
                          item.created_at
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
