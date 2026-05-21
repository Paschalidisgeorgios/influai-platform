"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CharacterLibrary from "../../components/CharacterLibrary";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FaceStudioPage() {
  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files) return;

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("faces")
        .upload(fileName, file);

      if (error) {
        console.log(error);
        continue;
      }

      const { data } = supabase.storage
        .from("faces")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    setImages(uploadedUrls);

    setUploading(false);
  }

  async function saveCharacter() {
    if (!name) {
      alert("Please enter a character name");
      return;
    }

    if (images.length === 0) {
      alert("Please upload reference images");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("characters")
        .insert([
          {
            name,
            reference_images: images,
          },
        ]);

      if (error) {
        console.log(error);
        alert("Failed to save character");
        return;
      }

      alert("Character saved successfully");

      setName("");
      setImages([]);
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <p className="text-yellow-600 tracking-[0.3em] text-xs mb-3">
            INFLUAI STUDIO
          </p>

          <h1 className="text-6xl font-bold mb-4">
            Face Studio
          </h1>

          <p className="text-gray-400 max-w-2xl">
            Create persistent AI characters with multiple
            reference images and identity consistency.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-3xl p-6">
            {/* CHARACTER NAME */}
            <div>
              <p className="text-yellow-600 tracking-[0.3em] text-xs mb-4">
                CHARACTER NAME
              </p>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Luxury Influencer"
                className="w-full h-14 bg-black border border-[#222] rounded-2xl px-5 text-white outline-none"
              />
            </div>

            {/* FACE UPLOAD */}
            <div className="mt-8">
              <p className="text-yellow-600 tracking-[0.3em] text-xs mb-4">
                FACE REFERENCES
              </p>

              <label className="border-2 border-dashed border-[#333] hover:border-yellow-700 transition rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[#0f0f0f]">
                <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-5 text-4xl">
                  +
                </div>

                <p className="text-gray-400 text-sm">
                  Upload multiple reference images
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              {uploading && (
                <p className="text-yellow-500 text-sm mt-4">
                  Uploading references...
                </p>
              )}
            </div>

            {/* IMAGE PREVIEW */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="rounded-2xl overflow-hidden border border-[#222]"
                  >
                    <img
                      src={img}
                      alt="Reference"
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* SAVE BUTTON */}
            <button
              onClick={saveCharacter}
              disabled={saving}
              className="w-full mt-8 bg-[#d4a35f] hover:bg-[#e0b97c] disabled:opacity-50 text-black font-semibold py-4 rounded-2xl transition"
            >
              {saving ? "Saving..." : "Save Character"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold">
                References
              </h2>

              <span className="bg-yellow-700/20 text-yellow-500 text-xs px-4 py-2 rounded-full">
                {images.length} IMAGES
              </span>
            </div>

            {images.length === 0 ? (
              <div className="bg-black border border-[#1a1a1a] rounded-3xl h-[600px] flex items-center justify-center">
                <p className="text-gray-600">
                  Uploaded references will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="bg-black border border-[#1a1a1a] rounded-3xl overflow-hidden"
                  >
                    <img
                      src={img}
                      alt="Reference"
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CHARACTER LIBRARY */}
        <div className="mt-20">
          <div className="mb-8">
            <p className="text-yellow-600 tracking-[0.3em] text-xs mb-3">
              CHARACTER LIBRARY
            </p>

            <h2 className="text-5xl font-bold">
              Saved Characters
            </h2>
          </div>

          <CharacterLibrary />
        </div>
      </div>
    </main>
  );
}