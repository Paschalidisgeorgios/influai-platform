"use client";

import { useEffect, useState } from "react";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Generation = {
  id: string;
  prompt: string;
  image_url: string;
  model: string;
  created_at: string;
};

export default function GenerationGallery() {

  const [generations,
    setGenerations] = useState<
      Generation[]
    >([]);

  const [loading,
    setLoading] =
    useState(true);

  /*
    LOAD
  */

  useEffect(() => {
    loadGenerations();
  }, []);

  async function loadGenerations() {

    const { data, error } =
      await supabase
        .from("generations")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    console.log("DATA:", data);

    console.log("ERROR:", error);

    if (error) return;

    /*
      ONLY VALID IMAGES
    */

    const validGenerations =
      (data || []).filter(
        (item: Generation) =>
          typeof item.image_url ===
            "string" &&
          item.image_url.startsWith(
            "https://"
          )
      );

    console.log(
      "VALID:",
      validGenerations
    );

    setGenerations(
      validGenerations
    );

    setLoading(false);
  }

  /*
    LOADING
  */

  if (loading) {

    return (
      <div className="text-white">
        Loading...
      </div>
    );
  }

  /*
    EMPTY
  */

  if (generations.length === 0) {

    return (
      <div className="text-white">
        No valid generations found.
      </div>
    );
  }

  /*
    GALLERY
  */

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

      {generations.map(
        (generation) => (

          <div
            key={generation.id}
            className="bg-[#080808] border border-[#1a1a1a] rounded-3xl overflow-hidden"
          >

            <img
              src={generation.image_url}
              alt={generation.prompt}
              className="w-full aspect-[3/4] object-cover"
            />

            <div className="p-6">

              <div className="mb-4">

                <div className="bg-[#1a140d] text-[#c7a36a] text-xs px-3 py-1 rounded-full inline-block">
                  {generation.model}
                </div>

              </div>

              <p className="text-white text-sm">
                {generation.prompt}
              </p>

            </div>

          </div>
        )
      )}

    </div>
  );
}