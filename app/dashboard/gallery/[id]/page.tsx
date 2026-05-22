"use client";

import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import toast from "react-hot-toast";

import { supabase } from "../../../lib/supabase";

type Character = {
  id: string;
  name: string;
  reference_images: string[];
};

type Generation = {
  id: string;
  prompt: string;
  image_url: string;
  model: string;
  created_at: string;
  character_id: string;

  characters?: Character;
};

export default function GenerationDetailPage() {

  const params = useParams();

  const router = useRouter();

  const id =
    params.id as string;

  const [generation,
    setGeneration] =
    useState<Generation | null>(
      null
    );

  const [loading,
    setLoading] =
    useState(true);

  const [deleting,
    setDeleting] =
    useState(false);

  /*
    LOAD GENERATION
  */

  useEffect(() => {

    if (id) {
      loadGeneration();
    }

  }, [id]);

  async function loadGeneration() {

    /*
      GET USER
    */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      setLoading(false);

      return;
    }

    /*
      LOAD GENERATION
    */

    const {
      data,
      error,
    } = await supabase
      .from("generations")
      .select(`
        *,
        characters (
          id,
          name,
          reference_images
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    console.log(
      "GENERATION:",
      data
    );

    console.log(
      "ERROR:",
      error
    );

    if (error) {

      setLoading(false);

      return;
    }

    setGeneration(data);

    setLoading(false);
  }

  /*
    DELETE GENERATION
  */

  async function deleteGeneration() {

    if (!generation) return;

    const confirmed =
      window.confirm(
        "Delete this generation?"
      );

    if (!confirmed) return;

    try {

      setDeleting(true);

      /*
        DELETE DATABASE
      */

      const { error } =
        await supabase
          .from("generations")
          .delete()
          .eq("id", generation.id);

      console.log(
        "DELETE ERROR:",
        error
      );

      if (error) {

        toast.error(
          "Failed to delete generation"
        );

        setDeleting(false);

        return;
      }

      toast.success(
        "Generation deleted"
      );

      /*
        REDIRECT
      */

      router.push(
        "/dashboard/gallery"
      );

    } catch (error) {

      console.log(error);

      toast.error(
        "Delete failed"
      );

    } finally {

      setDeleting(false);
    }
  }

  /*
    LOADING
  */

  if (loading) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-gray-400">
          Loading generation...
        </div>

      </main>
    );
  }

  /*
    NOT FOUND
  */

  if (!generation) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <h2 className="text-3xl font-bold mb-4">
            Generation not found
          </h2>

          <Link
            href="/dashboard/gallery"
            className="text-[#c7a36a]"
          >
            Back to gallery
          </Link>

        </div>

      </main>
    );
  }

  /*
    PAGE
  */

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}

        <div className="mb-12">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            InfluAI Generation
          </p>

          <h1 className="text-6xl font-bold mb-6">
            Generation Detail
          </h1>

          <p className="text-gray-400 text-lg">
            Full AI generated asset view.
          </p>

        </div>

        {/* CONTENT */}

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* IMAGE */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl overflow-hidden">

            <img
              src={generation.image_url}
              alt={generation.prompt}
              className="w-full object-cover"
            />

          </div>

          {/* INFO */}

          <div>

            {/* MODEL */}

            <div className="mb-10">

              <div className="bg-[#1a140d] text-[#c7a36a] text-sm px-4 py-2 rounded-full inline-block mb-6">
                {generation.model}
              </div>

              <h2 className="text-3xl font-bold mb-4">
                Prompt
              </h2>

              <p className="text-gray-300 leading-relaxed text-lg">
                {generation.prompt}
              </p>

            </div>

            {/* CHARACTER */}

            {generation.characters && (

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8 mb-8">

                <h3 className="text-2xl font-bold mb-6">
                  Used Character
                </h3>

                <Link
                  href={`/dashboard/characters/${generation.characters.id}`}
                >

                  <div className="flex items-center gap-5 hover:opacity-80 transition cursor-pointer">

                    {/* IMAGE */}

                    {generation.characters.reference_images?.[0] && (

                      <img
                        src={
                          generation.characters.reference_images[0]
                        }
                        alt={
                          generation.characters.name
                        }
                        className="w-24 h-24 object-cover rounded-2xl"
                      />

                    )}

                    {/* INFO */}

                    <div>

                      <h4 className="text-2xl font-bold mb-2">
                        {generation.characters.name}
                      </h4>

                      <p className="text-gray-500">
                        View character profile
                      </p>

                    </div>

                  </div>

                </Link>

              </div>
            )}

            {/* META */}

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

              <h3 className="text-2xl font-bold mb-6">
                Metadata
              </h3>

              <div className="space-y-4 text-sm">

                <div>

                  <span className="text-gray-500">
                    ID:
                  </span>

                  <p className="break-all mt-1">
                    {generation.id}
                  </p>

                </div>

                <div>

                  <span className="text-gray-500">
                    Created:
                  </span>

                  <p className="mt-1">
                    {new Date(
                      generation.created_at
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/dashboard/gallery"
                className="bg-[#1a1a1a] hover:bg-[#252525] transition px-6 py-3 rounded-2xl"
              >
                Back to Gallery
              </Link>

              <a
                href={generation.image_url}
                target="_blank"
                className="bg-[#c7a36a] text-black font-semibold hover:opacity-90 transition px-6 py-3 rounded-2xl"
              >
                Open Full Image
              </a>

              <button
                onClick={
                  deleteGeneration
                }

                disabled={deleting}

                className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-2xl disabled:opacity-50"
              >

                {deleting
                  ? "Deleting..."
                  : "Delete Generation"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}