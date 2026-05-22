"use client";

import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import toast from "react-hot-toast";

import {
  Sparkles,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Generation = {
  id: string;
  image_url: string;
  prompt: string;
};

type Character = {
  id: string;
  name: string;
  description: string;
  dna?: string;
  reference_images: string[];
  created_at: string;

  generations?: Generation[];
};

export default function CharacterDetailPage() {

  const params = useParams();

  const router = useRouter();

  const id =
    params.id as string;

  const [character,
    setCharacter] =
    useState<Character | null>(
      null
    );

  const [loading,
    setLoading] =
    useState(true);

  const [deleting,
    setDeleting] =
    useState(false);

  const [savingDNA,
    setSavingDNA] =
    useState(false);

  const [generatingDNA,
    setGeneratingDNA] =
    useState(false);

  const [dna,
    setDna] =
    useState("");

  /*
    LOAD CHARACTER
  */

  useEffect(() => {

    if (id) {
      loadCharacter();
    }

  }, [id]);

  async function loadCharacter() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      setLoading(false);

      return;
    }

    /*
      CHARACTER
    */

    const {
      data: characterData,
      error: characterError,
    } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (characterError) {

      setLoading(false);

      return;
    }

    /*
      GENERATIONS
    */

    const {
      data: generationData,
    } = await supabase
      .from("generations")
      .select("*")
      .eq("character_id", id)
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    setCharacter({
      ...characterData,
      generations:
        generationData || [],
    });

    setDna(
      characterData.dna || ""
    );

    setLoading(false);
  }

  /*
    AI DNA GENERATION
  */

  async function generateDNA() {

    if (
      !character?.reference_images
        ?.length
    ) {

      toast.error(
        "No reference images"
      );

      return;
    }

    try {

      setGeneratingDNA(true);

      toast.loading(
        "Analyzing character...",
        {
          id: "dna",
        }
      );

      const response =
        await fetch(
          "/api/generate-dna",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              images:
                character.reference_images,
            }),
          }
        );

      const data =
        await response.json();

      if (data.error) {

        toast.error(
          data.error,
          {
            id: "dna",
          }
        );

        return;
      }

      setDna(data.dna);

      toast.success(
        "DNA generated",
        {
          id: "dna",
        }
      );

    } catch (error) {

      console.log(error);

      toast.error(
        "DNA generation failed",
        {
          id: "dna",
        }
      );

    } finally {

      setGeneratingDNA(false);
    }
  }

  /*
    SAVE DNA
  */

  async function saveDNA() {

    try {

      setSavingDNA(true);

      const { error } =
        await supabase
          .from("characters")
          .update({
            dna,
          })
          .eq("id", id);

      if (error) {

        toast.error(
          "Failed to save DNA"
        );

        setSavingDNA(false);

        return;
      }

      toast.success(
        "Character DNA saved"
      );

    } catch (error) {

      console.log(error);

      toast.error(
        "Save failed"
      );

    } finally {

      setSavingDNA(false);
    }
  }

  /*
    DELETE CHARACTER
  */

  async function deleteCharacter() {

    const confirmed =
      window.confirm(
        "Delete this character?"
      );

    if (!confirmed) return;

    setDeleting(true);

    await supabase
      .from("generations")
      .delete()
      .eq("character_id", id);

    const { error } =
      await supabase
        .from("characters")
        .delete()
        .eq("id", id);

    if (error) {

      toast.error(
        "Failed to delete character"
      );

      setDeleting(false);

      return;
    }

    toast.success(
      "Character deleted"
    );

    router.push(
      "/dashboard/characters"
    );
  }

  /*
    LOADING
  */

  if (loading) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-gray-400">
          Loading character...
        </div>

      </main>
    );
  }

  /*
    NOT FOUND
  */

  if (!character) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <h2 className="text-3xl font-bold mb-4">
            Character not found
          </h2>

          <Link
            href="/dashboard/characters"
            className="text-[#c7a36a]"
          >
            Back to characters
          </Link>

        </div>

      </main>
    );
  }

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* HEADER */}

        <div className="mb-14">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            CineAI Character
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {character.name}
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-3xl">
            {character.description}
          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-4 mb-16">

          <Link
            href="/dashboard/characters"
            className="bg-[#1a1a1a] hover:bg-[#252525] transition px-6 py-3 rounded-2xl"
          >
            Back
          </Link>

          <button
            onClick={deleteCharacter}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-2xl disabled:opacity-50"
          >

            {deleting
              ? "Deleting..."
              : "Delete"}

          </button>

        </div>

        {/* DNA */}

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-6 md:p-8 mb-20">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

            <div>

              <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-xs mb-3">
                AI Character Intelligence
              </p>

              <h2 className="text-3xl font-bold">
                Character DNA
              </h2>

            </div>

            <div className="flex gap-3">

              {/* AI GENERATE */}

              <button
                onClick={generateDNA}

                disabled={generatingDNA}

                className="flex items-center gap-3 bg-[#c7a36a] text-black px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
              >

                <Sparkles
                  size={18}
                />

                {generatingDNA
                  ? "Analyzing..."
                  : "Generate DNA"}

              </button>

              {/* SAVE */}

              <button
                onClick={saveDNA}

                disabled={savingDNA}

                className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
              >

                {savingDNA
                  ? "Saving..."
                  : "Save DNA"}

              </button>

            </div>

          </div>

          <p className="text-gray-500 mb-6 max-w-3xl leading-relaxed">

            AI-generated persistent visual identity memory for cinematic consistency.

          </p>

          <textarea
            value={dna}

            onChange={(e) =>
              setDna(
                e.target.value
              )
            }

            placeholder="Character DNA..."

            className="w-full h-56 bg-black border border-[#1a1a1a] rounded-3xl p-6 resize-none outline-none focus:border-[#c7a36a]"
          />

        </div>

      </div>

    </main>
  );
}