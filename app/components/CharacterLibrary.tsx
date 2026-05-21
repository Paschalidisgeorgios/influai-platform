"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Character = {
  id: string;
  name: string;
  reference_images: string[];
};

export default function CharacterLibrary() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCharacters() {
    try {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        setCharacters([]);
        return;
      }

      setCharacters(data || []);
    } catch (error) {
      console.log(error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharacters();
  }, []);

  if (loading) {
    return (
      <div className="text-gray-500">
        Loading characters...
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-3xl p-12 text-center">

        <div className="text-6xl mb-4">
          🎭
        </div>

        <h3 className="text-2xl font-bold mb-3">
          No Characters Yet
        </h3>

        <p className="text-gray-500 mb-6">
          Create your first AI influencer character.
        </p>

        <a
          href="/dashboard/characters/create"
          className="inline-block bg-[#c7a36a] hover:bg-[#d6b27a] transition-all duration-200 text-black font-semibold px-6 py-3 rounded-2xl"
        >
          Create Character
        </a>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {characters.map((character) => (
        <a
          key={character.id}
          href={`/dashboard/characters/${character.id}`}
          className="group bg-[#0b0b0b] border border-[#1a1a1a] rounded-3xl overflow-hidden hover:border-[#c7a36a] transition-all duration-300"
        >

          {character.reference_images?.[0] && (
            <div className="overflow-hidden">
              <img
                src={character.reference_images[0]}
                alt={character.name}
                className="w-full h-80 object-cover group-hover:scale-105 transition-all duration-500"
              />
            </div>
          )}

          <div className="p-5">

            <h3 className="text-2xl font-bold mb-2">
              {character.name}
            </h3>

            <p className="text-gray-500 text-sm">
              {character.reference_images?.length || 0} reference images
            </p>

          </div>

        </a>
      ))}

    </div>
  );
}