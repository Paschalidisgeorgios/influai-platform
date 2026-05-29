"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import HeroBanner from "../studio/HeroBanner";
import SystemTicker from "../studio/SystemTicker";
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

export default function CreativeHome() {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const router = useRouter();
  const supabase = createClient();
  const { galleryRefreshKey } = useCreativeSuite();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<HomeTab>("images");
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<HomeAsset[]>([]);

  const placeholder =
    lang === "de"
      ? "Suche oder beschreibe dein nächstes Kampagnenvisual…"
      : "Search or describe your next campaign visual…";

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
    { id: "images", label: lang === "de" ? "Bilder" : "Images" },
    { id: "videos", label: lang === "de" ? "Videos" : "Videos" },
    { id: "moodboards", label: "Moodboards" },
  ];

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <HeroBanner language={lang} />
      <SystemTicker language={lang} />

      <div className="mx-auto mb-8 flex max-w-3xl items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <Plus className="h-5 w-5 shrink-0 text-orange-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={handleSearchSubmit}
          className="shrink-0 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
        >
          {lang === "de" ? "Erstellen" : "Create"}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === t.id
                ? "bg-slate-900 text-white"
                : "border border-gray-200 bg-white text-slate-600 hover:border-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {(showDemo ? DEMO_IMAGES.map((src, i) => ({ id: `demo-${i}`, src })) : []).map(
            (item) =>
              "src" in item ? (
                <div
                  key={item.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="" className="w-full object-cover" />
                  <div className="border-t border-gray-100 bg-white p-3 rounded-b-2xl">
                    <p className="text-xs font-medium text-slate-600 line-clamp-2">
                      {lang === "de" ? "Demo-Visual" : "Demo visual"}
                    </p>
                  </div>
                </div>
              ) : null
          )}
          {filtered.map((asset) => {
            const media = asset.video_url ?? asset.image_url;
            if (!media) return null;
            return (
              <Link
                key={asset.id}
                href={`/dashboard/assets`}
                className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                {asset.video_url ? (
                  <video src={asset.video_url} className="w-full object-cover" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.image_url!} alt="" className="w-full object-cover" />
                )}
                <div className="border-t border-gray-100 bg-white p-3 rounded-b-2xl">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {asset.workflow?.replace(/_/g, " ") ?? "Asset"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-2">
                    {asset.prompt}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
