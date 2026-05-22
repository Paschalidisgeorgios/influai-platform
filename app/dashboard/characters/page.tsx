"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { supabase } from "../../lib/supabase";

type Character = {
  id: string;
  name: string;
  description: string;
  reference_images: string[];
  created_at: string;
};

export default function CharactersPage() {

  const [characters,
    setCharacters] =
    useState<Character[]>([]);

  const [loading,
    setLoading] =
    useState(true);

  async function loadCharacters() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      setLoading(false);

      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .order(
        "created_at",
        { ascending: false }
      );

    if (error) {
      console.error("Failed to load characters:", error.message);
    }

    if (data) {
      setCharacters(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCharacters();
  }, []);

  return (

    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 text-white">

        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 md:mb-14">

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
              CineAI Studio
            </p>

            <h1 className="text-4xl md:text-6xl font-bold">
              Characters
            </h1>

          </div>

          <Link
            href="/dashboard/characters/create"
            className="bg-[#c7a36a] text-black px-6 py-4 rounded-2xl font-semibold hover:opacity-90 transition"
          >
            Create Character
          </Link>

        </div>

        {loading && (

          <div className="border border-[#1a1a1a] rounded-3xl p-16 text-center">

            <div className="w-12 h-12 rounded-full border-2 border-[#c7a36a] border-t-transparent animate-spin mx-auto mb-6" />

            <p className="text-gray-400">
              Loading characters...
            </p>

          </div>

        )}

        {!loading &&
          characters.length === 0 && (

          <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-12 md:p-20 text-center">

            <p className="text-xl font-bold mb-3">
              No characters yet
            </p>

            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create a character to unlock persistent identity in the image generator.
            </p>

            <Link
              href="/dashboard/characters/create"
              className="inline-block bg-[#c7a36a] text-black px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition"
            >
              Create Character
            </Link>

          </div>
        )}

        {/* GRID */}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {characters.map(
            (character) => (

              <Link
                key={character.id}
                href={`/dashboard/characters/${character.id}`}
                className="bg-[#080808] border border-[#1a1a1a] rounded-3xl overflow-hidden hover:border-[#c7a36a] transition"
              >

                {/* IMAGE */}

                {character.reference_images?.[0] && (

                  <img
                    src={
                      character.reference_images[0]
                    }
                    alt={character.name}
                    className="w-full aspect-square object-cover"
                  />

                )}

                {/* CONTENT */}

                <div className="p-6">

                  <h2 className="text-2xl font-bold mb-3">
                    {character.name}
                  </h2>

                  <p className="text-gray-500 line-clamp-3">
                    {character.description}
                  </p>

                </div>

              </Link>
            )
          )}

        </div>

    </div>
  );
}