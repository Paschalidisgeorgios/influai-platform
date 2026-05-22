"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

export default function CreateCharacterPage() {

  const router = useRouter();

  const [name, setName] =
    useState("");

  const [description,
    setDescription] =
    useState("");

  const [referenceImages,
    setReferenceImages] =
    useState<string[]>([]);

  const [loading,
    setLoading] =
    useState(false);

  const [uploading,
    setUploading] =
    useState(false);

  /*
    UPLOAD IMAGE
  */

  async function uploadImage(
    file: File
  ) {

    try {

      setUploading(true);

      /*
        FILE NAME
      */

      const fileName =
        `${Date.now()}-${file.name}`;

      /*
        UPLOAD
      */

      const {
        error,
      } = await supabase.storage
        .from("character-images")
        .upload(
          fileName,
          file
        );

        if (error) {

          console.log(
            "UPLOAD ERROR:",
            error
          );
        
          alert(
            JSON.stringify(error)
          );
        
          return;
        }

      /*
        GET URL
      */

      const {
        data,
      } = supabase.storage
        .from("character-images")
        .getPublicUrl(
          fileName
        );

      /*
        SAVE URL
      */

      setReferenceImages(
        [
          ...referenceImages,
          data.publicUrl,
        ]
      );

    } catch (error) {

      console.log(error);

      alert(
        "Upload failed"
      );

    } finally {

      setUploading(false);
    }
  }

  /*
    DROP
  */

  async function handleDrop(
    e: React.DragEvent
  ) {

    e.preventDefault();

    const files =
      e.dataTransfer.files;

    if (!files.length) return;

    await uploadImage(
      files[0]
    );
  }

  /*
    FILE INPUT
  */

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      e.target.files?.[0];

    if (!file) return;

    await uploadImage(file);
  }

  /*
    CREATE CHARACTER
  */

  async function createCharacter() {

    if (
      !name ||
      referenceImages.length === 0
    ) {

      alert(
        "Please add at least one image."
      );

      return;
    }

    setLoading(true);

    /*
      GET USER
    */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      alert(
        "Not authenticated"
      );

      setLoading(false);

      return;
    }

    /*
      INSERT CHARACTER
    */

    const {
      data,
      error,
    } = await supabase
      .from("characters")
      .insert([
        {
          name,
          description,

          reference_images:
            referenceImages,

          user_id:
            user.id,
        },
      ])
      .select()
      .single();

    console.log(
      "CHARACTER:",
      data
    );

    console.log(
      "ERROR:",
      error
    );

    setLoading(false);

    if (error) {

      alert(
        "Failed to create character."
      );

      return;
    }

    router.push(
      `/dashboard/characters/${data.id}`
    );
  }

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}

        <div className="mb-14">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            InfluAI
          </p>

          <h1 className="text-6xl font-bold mb-6">
            Create Character
          </h1>

          <p className="text-gray-500 text-lg">
            Build a cinematic AI influencer identity.
          </p>

        </div>

        {/* GRID */}

        <div className="grid lg:grid-cols-2 gap-12">

          {/* LEFT */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            {/* NAME */}

            <div className="mb-8">

              <label className="block text-sm text-gray-400 mb-3">
                Character Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Melodia"
                className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-5 py-4 outline-none focus:border-[#c7a36a]"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="mb-8">

              <label className="block text-sm text-gray-400 mb-3">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={5}
                placeholder="Describe the AI character..."
                className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-5 py-4 outline-none focus:border-[#c7a36a]"
              />

            </div>

            {/* UPLOAD */}

            <div className="mb-8">

              <label className="block text-sm text-gray-400 mb-3">
                Upload Reference Images
              </label>

              <div
                onDrop={handleDrop}

                onDragOver={(e) =>
                  e.preventDefault()
                }

                className="border-2 border-dashed border-[#1a1a1a] rounded-3xl p-10 text-center hover:border-[#c7a36a] transition"
              >

                <p className="text-gray-400 mb-4">
                  Drag & Drop Images Here
                </p>

                <p className="text-sm text-gray-600 mb-6">
                  or
                </p>

                <label className="inline-block bg-[#c7a36a] text-black px-6 py-3 rounded-2xl font-semibold cursor-pointer">

                  Select Images

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      handleFileChange
                    }
                  />

                </label>

              </div>

              {uploading && (

                <p className="text-sm text-[#c7a36a] mt-4">
                  Uploading image...
                </p>

              )}

            </div>

            {/* BUTTON */}

            <button
              onClick={createCharacter}

              disabled={
                loading ||
                uploading
              }

              className="w-full bg-[#c7a36a] text-black font-semibold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50"
            >

              {loading
                ? "Creating..."
                : "Create Character"}

            </button>

          </div>

          {/* RIGHT */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-8">
              Reference Images
            </h2>

            {referenceImages.length === 0 && (

              <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-16 text-center text-gray-500">

                No images uploaded yet.

              </div>

            )}

            <div className="grid grid-cols-2 gap-4">

              {referenceImages.map(
                (image) => (

                  <div
                    key={image}
                    className="rounded-2xl overflow-hidden border border-[#1a1a1a]"
                  >

                    <img
                      src={image}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}