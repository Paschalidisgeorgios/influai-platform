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

    console.log(
      "CHARACTERS:",
      data
    );

    console.log(
      "ERROR:",
      error
    );

    if (data) {
      setCharacters(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCharacters();
  }, []);

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-14">

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
              CineAI Studio
            </p>

            <h1 className="text-6xl font-bold">
              Characters
            </h1>

          </div>

          <Link
            href="/dashboard/characters/create"
            className="bg-[#c7a36a] text-black px-6 py-4 rounded-2xl font-semibold"
          >
            Create Character
          </Link>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="text-gray-500">
            Loading characters...
          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          characters.length === 0 && (

          <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-20 text-center text-gray-500">
            No characters yet.
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

    </main>
  );
}