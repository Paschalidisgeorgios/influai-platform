"use client";

/** Skeleton tile — matches gallery masonry card proportions. */

const SHIMMER =
  "animate-pulse bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]";

export function GallerySkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div
      aria-hidden
      className={`mb-3 w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] ${tall ? "h-72" : "h-48"}`}
    >
      <div className={`h-[72%] w-full ${SHIMMER}`} />
      <div className="space-y-2 p-3">
        <div className={`h-2.5 w-[80%] rounded ${SHIMMER}`} />
        <div className={`h-2 w-[40%] rounded ${SHIMMER}`} />
      </div>
    </div>
  );
}

type Props = {
  count?: number;
};

export default function GallerySkeletonGrid({ count = 8 }: Props) {
  const heights = [false, true, false, false, true, false, true, false];

  return (
    <div
      role="status"
      aria-label="Loading gallery"
      className="columns-2 gap-3 sm:columns-3 lg:columns-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <GallerySkeletonCard key={index} tall={heights[index % heights.length]} />
      ))}
      <span className="sr-only">Loading gallery assets</span>
    </div>
  );
}
