"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Palette, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import ObsidianShell from "../components/obsidian/ObsidianShell";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import type {
  BrandKit,
  BrandKitFontStyle,
  BrandKitTone,
} from "@/lib/brand/brandKit";

type BrandKitFormState = {
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_style: BrandKitFontStyle;
  tone: BrandKitTone;
  product_style: string;
  visual_rules: string;
  forbidden_elements: string;
};

const DEFAULT_FORM: BrandKitFormState = {
  name: "My Brand",
  primary_color: "#d8ad5f",
  secondary_color: "#1a1a1a",
  accent_color: "#ffffff",
  font_style: "sans-serif",
  tone: "professional",
  product_style: "",
  visual_rules: "",
  forbidden_elements: "",
};

const TONE_OPTIONS: { id: BrandKitTone; labelEn: string; labelDe: string }[] = [
  { id: "luxury", labelEn: "Luxury", labelDe: "Luxury" },
  { id: "minimal", labelEn: "Minimal", labelDe: "Minimal" },
  { id: "bold", labelEn: "Bold", labelDe: "Bold" },
  { id: "playful", labelEn: "Playful", labelDe: "Playful" },
  { id: "professional", labelEn: "Professional", labelDe: "Professional" },
  { id: "authentic", labelEn: "Authentic", labelDe: "Authentisch" },
];

const COPY = {
  en: {
    title: "Brand Kit",
    subtitle:
      "Define colors, tone, and visual rules — applied automatically to every generation.",
    kitName: "Kit name",
    primary: "Primary color",
    secondary: "Secondary color",
    accent: "Accent color",
    tone: "Brand tone",
    productStyle: "Product style",
    visualRules: "Visual rules",
    forbidden: "Forbidden elements",
    save: "Save Brand Kit",
    saving: "Saving…",
    saved: "Brand kit saved.",
    loadError: "Could not load brand kit.",
    saveError: "Could not save brand kit.",
    sessionExpired: "Session expired. Please sign in again.",
  },
  de: {
    title: "Brand Kit",
    subtitle:
      "Farben, Ton und visuelle Regeln — werden automatisch bei jeder Generierung angewendet.",
    kitName: "Kit-Name",
    primary: "Primärfarbe",
    secondary: "Sekundärfarbe",
    accent: "Akzentfarbe",
    tone: "Brand-Ton",
    productStyle: "Produktstil",
    visualRules: "Visuelle Regeln",
    forbidden: "Verbotene Elemente",
    save: "Brand Kit speichern",
    saving: "Speichern…",
    saved: "Brand Kit gespeichert.",
    loadError: "Brand Kit konnte nicht geladen werden.",
    saveError: "Brand Kit konnte nicht gespeichert werden.",
    sessionExpired: "Sitzung abgelaufen. Bitte erneut anmelden.",
  },
} as const;

function kitToForm(kit: BrandKit): BrandKitFormState {
  return {
    name: kit.name,
    primary_color: kit.primary_color,
    secondary_color: kit.secondary_color,
    accent_color: kit.accent_color,
    font_style: kit.font_style,
    tone: kit.tone,
    product_style: kit.product_style,
    visual_rules: kit.visual_rules,
    forbidden_elements: kit.forbidden_elements,
  };
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8ad5f]">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={`${id}-picker`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
          aria-label={label}
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d8ad5f]/50"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default function BrandKitPage() {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const copy = COPY[lang];
  const supabase = createClient();

  const [form, setForm] = useState<BrandKitFormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadKit = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErrorMessage(copy.sessionExpired);
        return;
      }

      const res = await fetch("/api/brand-kit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as {
        brandKit?: BrandKit | null;
        error?: string;
      };

      if (!res.ok) {
        setErrorMessage(data.error ?? copy.loadError);
        return;
      }

      if (data.brandKit) {
        setForm(kitToForm(data.brandKit));
      }
    } catch {
      setErrorMessage(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, copy.sessionExpired, supabase.auth]);

  useEffect(() => {
    void loadKit();
  }, [loadKit]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErrorMessage(copy.sessionExpired);
        return;
      }

      const res = await fetch("/api/brand-kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as {
        brandKit?: BrandKit;
        error?: string;
      };

      if (!res.ok) {
        setErrorMessage(data.error ?? copy.saveError);
        return;
      }

      if (data.brandKit) {
        setForm(kitToForm(data.brandKit));
      }
      setSuccessMessage(copy.saved);
    } catch {
      setErrorMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ObsidianLayout>
      <ObsidianShell>
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="mb-8 flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8ad5f]/40 bg-[#d8ad5f]/10 text-[#d8ad5f]">
              <Palette className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
              <p className="mt-1 text-sm text-white/50">{copy.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-white/40">
              <Loader2 className="h-6 w-6 animate-spin text-[#d8ad5f]" />
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSave(e)}
              className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div>
                <label
                  htmlFor="kit-name"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8ad5f]"
                >
                  {copy.kitName}
                </label>
                <input
                  id="kit-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d8ad5f]/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <ColorField
                  id="primary-color"
                  label={copy.primary}
                  value={form.primary_color}
                  onChange={(hex) =>
                    setForm((c) => ({ ...c, primary_color: hex }))
                  }
                />
                <ColorField
                  id="secondary-color"
                  label={copy.secondary}
                  value={form.secondary_color}
                  onChange={(hex) =>
                    setForm((c) => ({ ...c, secondary_color: hex }))
                  }
                />
                <ColorField
                  id="accent-color"
                  label={copy.accent}
                  value={form.accent_color}
                  onChange={(hex) =>
                    setForm((c) => ({ ...c, accent_color: hex }))
                  }
                />
              </div>

              <fieldset>
                <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8ad5f]">
                  {copy.tone}
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TONE_OPTIONS.map((option) => {
                    const label = lang === "de" ? option.labelDe : option.labelEn;
                    const checked = form.tone === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition ${
                          checked
                            ? "border-[#d8ad5f] bg-[#d8ad5f]/15 text-[#efc777]"
                            : "border-white/10 text-white/50 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="brand-tone"
                          value={option.id}
                          checked={checked}
                          onChange={() =>
                            setForm((c) => ({ ...c, tone: option.id }))
                          }
                          className="sr-only"
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="product-style"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8ad5f]"
                >
                  {copy.productStyle}
                </label>
                <textarea
                  id="product-style"
                  rows={3}
                  value={form.product_style}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, product_style: e.target.value }))
                  }
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d8ad5f]/50"
                />
              </div>

              <div>
                <label
                  htmlFor="visual-rules"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8ad5f]"
                >
                  {copy.visualRules}
                </label>
                <textarea
                  id="visual-rules"
                  rows={3}
                  value={form.visual_rules}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, visual_rules: e.target.value }))
                  }
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d8ad5f]/50"
                />
              </div>

              <div>
                <label
                  htmlFor="forbidden-elements"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8ad5f]"
                >
                  {copy.forbidden}
                </label>
                <textarea
                  id="forbidden-elements"
                  rows={3}
                  value={form.forbidden_elements}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      forbidden_elements: e.target.value,
                    }))
                  }
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d8ad5f]/50"
                />
              </div>

              {errorMessage ? (
                <p className="text-sm text-red-400" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              {successMessage ? (
                <p
                  className="rounded-xl border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-4 py-3 text-sm font-medium text-[#efc777]"
                  role="status"
                >
                  {successMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d8ad5f] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#efc777] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {copy.save}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </ObsidianShell>
    </ObsidianLayout>
  );
}
