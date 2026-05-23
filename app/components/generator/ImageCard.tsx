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

  const imageUrl =
    typeof image.url === "string" &&
    image.url.trim().startsWith("https://") &&
    isHttpImageUrl(image.url)
      ? image.url.trim()
      : null;

  const promptText =
    typeof image.prompt === "string"
      ? image.prompt
      : "";

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
        promptText
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

    <div className="flex flex-col bg-black border border-[#1a1a1a] rounded-2xl">

      {/* IMAGE — must render above text; fixed aspect prevents 0 height */}

      <div className="p-4 pb-0 w-full shrink-0">

        {!imageUrl || imageError ? (

          <div className="flex w-full aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-[#1a1a1a] bg-[#080808] text-sm text-gray-500">
            Image could not be displayed.
          </div>

        ) : (

          <img
            src={imageUrl}
            alt="Generated AI image"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="block w-full aspect-[4/5] object-cover rounded-2xl bg-[#080808]"
          />

        )}

      </div>

      {/* PROMPT — below image, never used as image src */}

      {promptText ? (

        <p className="px-4 pt-3 text-sm text-gray-400 line-clamp-2">
          {promptText}
        </p>

      ) : null}

      {/* ACTIONS */}

      <div className="p-4">

        <div className="flex flex-col gap-3">

          <button
            onClick={
              downloadImage
            }
            disabled={!imageUrl || imageError}
            className="w-full flex items-center justify-center gap-2 bg-[#c7a36a] text-black py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >

            <Download
              size={16}
            />

            Download

          </button>

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

          <button
            onClick={() =>
              onReusePrompt(
                promptText
              )
            }
            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] transition py-3 rounded-xl font-semibold"
          >

            <RotateCcw
              size={16}
            />

            Reuse Prompt

          </button>

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
