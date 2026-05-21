"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Generation {
  id: number;
  prompt: string;
  image_url: string;
  model: string;
  created_at: string;
}

export default function HistoryGallery() {
  const [images, setImages] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadImages() {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setImages(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadImages();

    const channel = supabase
      .channel("generations-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "generations",
        },
        (payload) => {
          const newImage = payload.new as Generation;

          setImages((prev) => [newImage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-yellow-600 tracking-[0.3em] text-xs mb-2">
            HISTORY
          </p>

          <h2 className="text-4xl font-bold text-white">
            Recent Generations
          </h2>
        </div>

        <button
          onClick={loadImages}
          className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] px-5 py-3 rounded-2xl text-white transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">
          Loading gallery...
        </div>
      ) : images.length === 0 ? (
        <div className="text-gray-500">
          No images generated yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((item) => (
            <div
              key={item.id}
              className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-3xl overflow-hidden"
            >
              <img
                src={item.image_url}
                alt={item.prompt}
                className="w-full aspect-[3/4] object-cover"
              />

              <div className="p-5">
                <p className="text-sm text-gray-300 line-clamp-3 mb-4">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="bg-yellow-700/20 text-yellow-500 text-xs px-3 py-2 rounded-full">
                    {item.model}
                  </span>

                  <a
                    href={item.image_url}
                    target="_blank"
                    className="text-sm text-white hover:text-yellow-400 transition"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}