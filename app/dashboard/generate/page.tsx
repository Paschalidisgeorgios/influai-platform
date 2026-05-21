"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "../../lib/supabase";

const supabase = createClient();

interface Character {
  id: string;
  name: string;
  style: string;
  gender: string;
  face_image: string;
}

export default function GeneratePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] =
    useState<Character | null>(null);

  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("USER:", user);

    if (!user) {
      console.log("No user found");
      return;
    }

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id);

    console.log("CHARACTERS:", data);
    console.log("ERROR:", error);

    if (data) {
      setCharacters(data);

      if (data.length > 0) {
        setSelectedCharacter(data[0]);
      }
    }
  }

  async function generateImage() {
    try {
      if (!selectedCharacter) {
        alert("Please select a character");
        return;
      }

      if (!prompt) {
        alert("Please enter a prompt");
        return;
      }

      setLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          referenceImage: selectedCharacter.face_image,
          characterId: selectedCharacter.id,
        }),
      });

      const data = await response.json();

      console.log("API RESPONSE:", data);

      if (data.image) {
        setGeneratedImage(data.image);
      } else {
        alert("No image returned");
      }
    } catch (error) {
      console.error(error);
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black p-8 text-white"
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.4em] text-[#D6A35D]">
            INFLUAI GENERATOR
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] lg:text-7xl">
            Consistent AI Generation
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-zinc-500">
            Generate cinematic AI influencers with persistent identity
            consistency.
          </p>
        </div>

        {/* CHARACTER SELECTION */}
        <div className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#D6A35D]">
                Character Selection
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                Choose AI Influencer
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400">
              {characters.length} Characters
            </div>
          </div>

          {characters.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-500">
              Create an AI influencer first
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className={`overflow-hidden rounded-3xl border transition ${
                    selectedCharacter?.id === character.id
                      ? "border-[#D6A35D]"
                      : "border-white/10"
                  } bg-white/5 text-left`}
                >
                  <div className="relative h-[260px] w-full overflow-hidden">
                    <img
                      src={character.face_image}
                      alt={character.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="text-2xl font-semibold">
                      {character.name}
                    </h3>

                    <p className="mt-3 text-zinc-500">
                      {character.style}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs uppercase text-zinc-400">
                        {character.gender}
                      </div>

                      {selectedCharacter?.id === character.id && (
                        <span className="text-sm text-[#D6A35D]">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PROMPT */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-[#D6A35D]">
            AI Prompt
          </p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Luxury influencer in Monaco, cinematic editorial photography, ultra realistic, golden hour lighting..."
            className="mt-4 h-32 w-full rounded-2xl border border-white/10 bg-black px-6 py-5 text-white outline-none"
          />

          <button
            onClick={generateImage}
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[#D6A35D] py-5 font-semibold text-black transition hover:opacity-90"
          >
            {loading
              ? "Generating..."
              : "Generate Consistent AI Image"}
          </button>
        </div>

        {/* RESULT */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-4xl font-bold">AI Result</h2>

            <div className="rounded-full bg-[#D6A35D]/10 px-4 py-2 text-sm text-[#D6A35D]">
              CONSISTENCY MODE
            </div>
          </div>

          {generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full rounded-3xl"
            />
          ) : (
            <div className="flex h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-black text-zinc-500">
              Your consistent AI influencer will appear here
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}