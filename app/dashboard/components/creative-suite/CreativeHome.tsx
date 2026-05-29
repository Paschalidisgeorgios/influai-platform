"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "./CreativeSuiteProvider";

type HomeAsset = {
  id: string;
  prompt: string;
  image_url: string | null;
  video_url: string | null;
  workflow: string | null;
  is_favorite: boolean;
  created_at: string;
};

type HomeTab = "images" | "videos" | "moodboards";

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
  "https://images.unsplash.com/photo-1579783902618-a3fb39279bda?w=800&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
];

function workflowLabel(workflow: string | null) {
  if (!workflow || workflow === "standard") return "Standard";
  return workflow.replace(/_/g, " ");
}

export default function CreativeHome() {
  const { language } = useDashboardLanguage();
  const router = useRouter();
  const supabase = createClient();
  const { galleryRefreshKey, handleRegenerate } = useCreativeSuite();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<HomeTab>("images");
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<HomeAsset[]>([]);

  const announcement =
    language === "de"
      ? "Erstelle kampagnenfähige Visuals mit InfluExAi."
      : "Create campaign-ready visuals with InfluExAi.";

  const placeholder =
    language === "de"
      ? "Suche oder beschreibe dein nächstes Kampagnenvisual..."
      : "Search or describe your next campaign visual...";

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/generations?limit=48&offset=0", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const rows: HomeAsset[] = Array.isArray(data.generations)
        ? data.generations
        : [];
      setAssets(rows);
    } catch (error) {
      console.error("Home assets load error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets, galleryRefreshKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (tab === "videos" && !asset.video_url) return false;
      if (tab === "images" && asset.video_url) return false;
      if (tab === "moodboards") return false;
      if (!q) return true;
      return asset.prompt?.toLowerCase().includes(q);
    });
  }, [assets, query, tab]);

  const showDemo = !loading && filtered.length === 0 && tab !== "moodboards";

  function handleSearchSubmit() {
    if (!query.trim()) return;
    router.push(`/dashboard/image?prompt=${encodeURIComponent(query.trim())}`);
  }

  const tabs: { id: HomeTab; label: string }[] = [
    { id: "images", label: language === "de" ? "Bilder" : "Images" },
    { id: "videos", label: language === "de" ? "Videos" : "Videos" },
    { id: "moodboards", label: "Moodboards" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-8 text-sm font-semibold text-white">{announcement}</p>

      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-white/10 bg-[#1c1c1f] px-5 py-4 shadow-2xl">
        <Plus className="h-5 w-5 shrink-0 text-white/60" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        <button
          type="button"
          onClick={handleSearchSubmit}
          className="shrink-0 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-12 mb-6 flex flex-wrap items-center gap-8">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`text-sm transition ${
              tab === item.id
                ? "font-bold text-white"
                : "font-semibold text-white/45 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "moodboards" ? (
        <p className="text-sm text-white/50">
          {language === "de" ? "Moodboards kommen demnächst." : "Moodboards coming soon."}
        </p>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {showDemo
            ? DEMO_IMAGES.map((src, index) => (
                <div
                  key={`demo-${index}`}
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <img src={src} alt="" className="w-full object-cover" />
                </div>
              ))
            : null}
          {filtered.map((asset) => (
            <article
              key={asset.id}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/25"
            >
              {asset.video_url ? (
                <video
                  src={asset.video_url}
                  className="w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : asset.image_url ? (
                <img src={asset.image_url} alt="" className="w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-white/30">
                  …
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="text-[10px] font-bold uppercase tracking-wide text-orange-300">
                  {workflowLabel(asset.workflow)}
                </p>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/dashboard/gallery/${asset.id}`}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur"
                  >
                    {language === "de" ? "Öffnen" : "Open"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRegenerate(asset.prompt, null)}
                    className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white"
                  >
                    {language === "de" ? "Variante" : "Variant"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
