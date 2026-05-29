"use client";

export type SocialFormatOption = {
  value: string;
  label: string;
  subtitle: string;
  icon: "instagram" | "tiktok" | "instagram-ig" | "story" | "youtube" | "shorts";
};

export const SOCIAL_FORMAT_OPTIONS: SocialFormatOption[] = [
  {
    value: "square",
    label: "Square",
    subtitle: "Universal Post",
    icon: "instagram",
  },
  {
    value: "tiktok",
    label: "TikTok / Reels",
    subtitle: "Vertical Short",
    icon: "tiktok",
  },
  {
    value: "instagram_post",
    label: "Instagram Post",
    subtitle: "Feed Portrait",
    icon: "instagram-ig",
  },
  {
    value: "instagram_story",
    label: "Instagram Story",
    subtitle: "Story Format",
    icon: "story",
  },
  {
    value: "youtube_thumbnail",
    label: "YouTube Thumb",
    subtitle: "Landscape",
    icon: "youtube",
  },
  {
    value: "youtube_shorts",
    label: "YouTube Shorts",
    subtitle: "Vertical Shorts",
    icon: "shorts",
  },
];

function FormatIcon({ kind }: { kind: SocialFormatOption["icon"] }) {
  switch (kind) {
    case "instagram":
      return (
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-sm font-black text-white shadow-sm"
          aria-hidden
        >
          I
        </span>
      );
    case "instagram-ig":
      return (
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-xs font-black text-white shadow-sm"
          aria-hidden
        >
          IG
        </span>
      );
    case "story":
      return (
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-sm font-black text-white shadow-sm"
          aria-hidden
        >
          S
        </span>
      );
    case "tiktok":
      return (
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-black text-white shadow-sm"
          aria-hidden
        >
          T
        </span>
      );
    case "youtube":
      return (
        <span
          className="flex h-11 w-11 items-center justify-center rounded-md bg-[#ff0000] text-white shadow-sm"
          aria-hidden
        >
          <span className="ml-0.5 border-y-[6px] border-l-[10px] border-y-transparent border-l-white" />
        </span>
      );
    case "shorts":
      return (
        <span
          className="flex h-11 w-11 flex-col items-center justify-center rounded-md bg-[#ff0000] text-[9px] font-black text-white shadow-sm"
          aria-hidden
        >
          <span className="border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
          <span className="mt-0.5">Shorts</span>
        </span>
      );
    default:
      return null;
  }
}

type SocialFormatSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SocialFormatSelector({
  value,
  onChange,
}: SocialFormatSelectorProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        Format
      </p>
      <div className="mt-2 w-full overflow-x-auto pb-3">
        <div className="flex min-w-max items-stretch gap-4 px-1">
          {SOCIAL_FORMAT_OPTIONS.map((format) => {
            const active = value === format.value;
            return (
              <button
                key={format.value}
                type="button"
                onClick={() => onChange(format.value)}
                aria-pressed={active}
                className={`flex h-40 w-36 shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border bg-white p-4 transition hover:border-gray-300 hover:shadow-sm ${
                  active
                    ? "border-orange-500 bg-orange-50/40 shadow-sm ring-1 ring-orange-500"
                    : "border-gray-200"
                }`}
              >
                <FormatIcon kind={format.icon} />
                <span className="text-center">
                  <span className="block text-xs font-bold text-slate-900">
                    {format.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                    {format.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
