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

export default function ImageGeneratorPage() {

  const [prompt, setPrompt] =
    useState("");

  const [image, setImage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [characters, setCharacters] =
    useState<Character[]>([]);

  const [selectedCharacter,
    setSelectedCharacter] =
    useState<Character | null>(null);

  /*
    LOAD CHARACTERS
  */

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {

    const { data, error } =
      await supabase
        .from("characters")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.log(error);
      return;
    }

    setCharacters(data || []);
  }

  /*
    GENERATE IMAGE
  */

  async function generateImage() {

    if (!prompt) {
      alert("Enter a prompt");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        "/api/image-generator",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            prompt,

            model: "playground",

            referenceImages:
              selectedCharacter?.reference_images || [],

            characterId:
              selectedCharacter?.id || null,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "FULL API RESPONSE:",
        data
      );

      if (data.error) {

        alert(data.error);

        return;
      }

      console.log(
        "IMAGE URL:",
        data.image
      );

      setImage(data.image);

    } catch (error) {

      console.log(error);

      alert("Generation failed");

    } finally {

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-14">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            CineAI Studio
          </p>

          <h1 className="text-6xl font-bold mb-6">
            AI Image Generator
          </h1>

          <p className="text-gray-400 text-lg">
            Generate cinematic AI images with consistent influencer characters.
          </p>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            {/* CHARACTER */}
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

            {/* REFERENCE IMAGES */}
            {selectedCharacter && (

              <div className="mb-8">

                <p className="text-sm text-gray-400 mb-4">
                  Reference Images
                </p>

                <div className="flex gap-4">

                  {selectedCharacter.reference_images?.map(
                    (img) => (

                      <img
                        key={img}
                        src={img}
                        alt=""
                        className="w-24 h-24 object-cover rounded-2xl"
                      />

                    )
                  )}

                </div>

              </div>
            )}

            {/* PROMPT */}
            <div className="mb-8">

              <label className="block text-sm text-gray-400 mb-3">
                Prompt
              </label>

              <textarea
                value={prompt}

                onChange={(e) =>
                  setPrompt(e.target.value)
                }

                className="w-full h-40 bg-black border border-[#1a1a1a] rounded-2xl p-4 resize-none"
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={generateImage}

              disabled={loading}

              className="w-full bg-[#c7a36a] text-black font-semibold py-4 rounded-2xl"
            >
              {loading
                ? "Generating..."
                : "Generate Image"}
            </button>

          </div>

          {/* RIGHT */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Result
              </h2>

              <div className="bg-[#1a140d] text-[#c7a36a] text-sm px-4 py-2 rounded-full">
                SDXL
              </div>

            </div>

            {image ? (

              <div>

                <img
                  src={image}
                  alt="Generated"
                  className="w-full rounded-3xl"
                />

                {/* DEBUG URL */}
                <p className="text-xs text-gray-500 mt-4 break-all">
                  {image}
                </p>

              </div>

            ) : (

              <div className="h-[600px] border border-dashed border-[#1a1a1a] rounded-3xl flex items-center justify-center text-gray-500">
                Generated image appears here
              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}