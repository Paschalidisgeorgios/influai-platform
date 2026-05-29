"use client";

type CreativeToolResultProps = {
  imageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  plan?: Record<string, unknown> | null;
  profile?: { name: string; description?: string } | null;
  moodboard?: { title: string; items: { note: string; url?: string }[] } | null;
  emptyLabel?: string;
};

export default function CreativeToolResult({
  imageUrl,
  videoUrl,
  audioUrl,
  plan,
  profile,
  moodboard,
  emptyLabel = "—",
}: CreativeToolResultProps) {
  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        controls
        playsInline
        className="w-full rounded-xl bg-black"
      />
    );
  }

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="w-full rounded-xl object-contain"
      />
    );
  }

  if (audioUrl) {
    return <audio src={audioUrl} controls className="w-full" />;
  }

  if (profile) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
        <p className="text-sm font-bold text-slate-900">{profile.name}</p>
        {profile.description ? (
          <p className="mt-2 text-xs font-medium text-slate-600">
            {profile.description}
          </p>
        ) : null}
      </div>
    );
  }

  if (moodboard) {
    return (
      <div className="space-y-3 text-left">
        <p className="text-sm font-bold text-slate-900">{moodboard.title}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {moodboard.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
              ) : null}
              <p className="text-xs font-medium text-slate-700">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (plan) {
    return (
      <pre className="max-h-80 overflow-auto rounded-xl border border-gray-200 bg-white p-4 text-left text-xs font-medium text-slate-700 shadow-sm">
        {JSON.stringify(plan, null, 2)}
      </pre>
    );
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm font-medium text-slate-400 shadow-sm">
      {emptyLabel}
    </div>
  );
}
