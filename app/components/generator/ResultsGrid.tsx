"use client";

import { isHttpImageUrl } from "../../lib/image-url";

import ImageCard from "./ImageCard";

type Image = {
  url: string;
  prompt: string;
};

function isValidResultImage(
  image: Image
): boolean {
  return (
    isHttpImageUrl(image.url) &&
    typeof image.prompt === "string"
  );
}

type Props = {
  images: Image[];

  onReusePrompt: (
    prompt: string
  ) => void;

  onCreateVariations: () => void;
};

export default function ResultsGrid({
  images,
  onReusePrompt,
  onCreateVariations,
}: Props) {

  if (images.length === 0) {

    return (

      <div className="h-[500px] md:h-[850px] border border-dashed border-[#1a1a1a] rounded-3xl flex items-center justify-center text-gray-500 text-center p-10">

        Your cinematic AI generations will appear here.

      </div>
    );
  }

  const validImages = images
    .filter(isValidResultImage)
    .map((image) => ({
      url: image.url.trim(),
      prompt: image.prompt,
    }));

  if (validImages.length === 0) {

    return (

      <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-10 text-center text-gray-500">
        Images were generated but could not be displayed. Try generating again.
      </div>
    );
  }

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {validImages.map(
        (image, index) => (

          <ImageCard
            key={`${image.url}-${index}`}

            image={image}

            onReusePrompt={
              onReusePrompt
            }

            onCreateVariations={
              onCreateVariations
            }
          />

        )
      )}

    </div>
  );
}