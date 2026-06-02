"use client";

import Image from "next/image";
import { LANDING_MEDIA_IMAGE_FALLBACK } from "@/lib/landing/landing-media-proof";

export type ImageVariantCardProps = {
  src: string;
  alt: string;
  label?: string;
  /** CSS aspect-ratio value, e.g. "4/5" */
  aspectRatio?: string;
  priority?: boolean;
  sizes?: string;
  objectPosition?: string;
  className?: string;
  imageClassName?: string;
};

export default function ImageVariantCard({
  src,
  alt,
  label,
  aspectRatio = "4/5",
  priority = false,
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px",
  objectPosition = "center",
  className = "",
  imageClassName = "",
}: ImageVariantCardProps) {
  return (
    <figure
      className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a] ${className}`}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        className={`object-cover ${imageClassName}`}
        style={{ objectPosition }}
        onError={(event) => {
          const img = event.currentTarget;
          if (img.src.includes(LANDING_MEDIA_IMAGE_FALLBACK)) return;
          img.src = LANDING_MEDIA_IMAGE_FALLBACK;
        }}
      />
      {label ? (
        <figcaption className="absolute bottom-1.5 left-1.5 z-[1] max-w-[calc(100%-0.75rem)] truncate rounded-md bg-black/65 px-1.5 py-0.5 text-[9px] font-semibold text-white/90 backdrop-blur-sm">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
