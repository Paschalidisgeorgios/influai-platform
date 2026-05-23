"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { isHttpImageUrl } from "../../lib/image-url";

import {
  Download,
  Wand2,
  RotateCcw,
  Copy,
} from "lucide-react";

type Props = {
  image: {
    url: string;
    prompt: string;
  };

  onReusePrompt: (
    prompt: string
  ) => void;

  onCreateVariations: () => void;
};

export default function ImageCard({
  image,
  onReusePrompt,
  onCreateVariations,
}: Props) {

  const [imageError, setImageError] =
    useState(false);

  const imageUrl = isHttpImageUrl(image.url)
    ? image.url.trim()
    : null;

  if (!imageUrl || imageError) {
    return (
      <div className="bg-black border border-dashed border-[#1a1a1a] rounded-2xl p-6 text-center text-gray-500">
        Image could not be displayed.
      </div>
    );
  }

  /*
    DOWNLOAD
  */

  async function downloadImage() {

    if (!imageUrl) {
      return;
    }

    try {

      const response =
        await fetch(imageUrl);

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `influai-${Date.now()}.png`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      toast.success(
        "Image downloaded"
      );

    } catch {

      toast.error(
        "Download failed"
      );
    }
  }

  /*
    COPY PROMPT
  */

  async function copyPrompt() {

    try {

      await navigator.clipboard.writeText(
        image.prompt
      );

      toast.success(
        "Prompt copied"
      );

    } catch {

      toast.error(
        "Copy failed"
      );
    }
  }

  return (

    <div className="bg-black border border-[#1a1a1a] rounded-2xl overflow-hidden">

      {/* IMAGE */}

      <img
        src={image.url}
        alt="Generated image"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className="w-full aspect-square object-cover bg-black"
      />

      {/* ACTIONS */}

      <div className="p-4">

        <div className="flex flex-col gap-3">

          {/* DOWNLOAD */}

          <button
            onClick={
              downloadImage
            }

            className="w-full flex items-center justify-center gap-2 bg-[#c7a36a] text-black py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >

            <Download
              size={16}
            />

            Download

          </button>

          {/* VARIATIONS */}

          <button
            onClick={
              onCreateVariations
            }

            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] transition py-3 rounded-xl font-semibold"
          >

            <Wand2
              size={16}
            />

            Create Variations

          </button>

          {/* REUSE */}

          <button
            onClick={() =>
              onReusePrompt(
                image.prompt
              )
            }

            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] transition py-3 rounded-xl font-semibold"
          >

            <RotateCcw
              size={16}
            />

            Reuse Prompt

          </button>

          {/* COPY */}

          <button
            onClick={
              copyPrompt
            }

            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] transition py-3 rounded-xl font-semibold"
          >

            <Copy
              size={16}
            />

            Copy Prompt

          </button>

        </div>

      </div>

    </div>
  );
}