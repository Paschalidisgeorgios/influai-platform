"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateCharacterPage() {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  async function handleCreateCharacter() {
    if (!name || !files || files.length === 0) {
      alert("Please add name and images");
      return;
    }

    try {
      setLoading(true);

      const uploadedImages: string[] = [];

      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;

        console.log("UPLOADING:", fileName);

        const { data, error } = await supabase.storage
          .from("characters")
          .upload(fileName, file);

        console.log("UPLOAD DATA:", data);
        console.log("UPLOAD ERROR:", error);

        if (error) {
          alert(error.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("characters")
          .getPublicUrl(fileName);

        console.log("PUBLIC URL:", publicUrlData);

        uploadedImages.push(publicUrlData.publicUrl);
      }

      console.log("FINAL IMAGES:", uploadedImages);

      const { error: insertError } = await supabase
        .from("characters")
        .insert({
          name,
          reference_images: uploadedImages,
        });

      console.log("DB ERROR:", insertError);

      if (insertError) {
        alert(insertError.message);
        return;
      }

      alert("Character created!");

      window.location.href = "/dashboard/characters";
    } catch (error) {
      console.log("FULL ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;

    if (!selectedFiles) return;

    setFiles(selectedFiles);

    const previews = Array.from(selectedFiles).map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewImages(previews);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-12">
          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            CineAI Studio
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Create Character
          </h1>

          <p className="text-gray-400 text-lg">
            Upload cinematic reference images for your AI influencer.
          </p>
        </div>

        <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-3xl p-8">

          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-3">
              Character Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sophia"
              className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-5 py-4 outline-none focus:border-[#c7a36a]"
            />
          </div>

          <div className="mb-10">

            <label className="block text-sm text-gray-400 mb-3">
              Reference Images
            </label>

            <label className="border-2 border-dashed border-[#1a1a1a] rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer">

              <div className="text-5xl mb-4">
                📸
              </div>

              <p className="text-lg font-semibold mb-2">
                Upload Character Images
              </p>

              <input
                type="file"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
            </label>

          </div>

          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">

              {previewImages.map((image) => (
                <div
                  key={image}
                  className="rounded-2xl overflow-hidden"
                >
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-60 object-cover"
                  />
                </div>
              ))}

            </div>
          )}

          <button
            onClick={handleCreateCharacter}
            disabled={loading}
            className="w-full bg-[#c7a36a] text-black font-bold py-5 rounded-2xl"
          >
            {loading ? "Creating Character..." : "Create Character"}
          </button>

        </div>
      </div>
    </main>
  );
}