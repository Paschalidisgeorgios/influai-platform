"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CreditCard,
  Globe,
  LogOut,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ObsidianLayout from "../components/obsidian/ObsidianLayout";
import SettingsSection from "../components/settings/SettingsSection";
import { useCreativeSuite } from "../components/creative-suite/CreativeSuiteProvider";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import TrustCommercialFaqList from "@/app/components/shared/TrustCommercialFaqList";
import { getTrustCommercialFaq } from "@/lib/copy/trust-commercial-faq";
import {
  EXPORT_FORMAT_OPTIONS,
  SETTINGS_COPY,
  type ExportFormatPref,
} from "@/lib/copy/settings-copy";
import {
  readExportFormatPref,
  writeExportFormatPref,
} from "@/app/lib/settings/export-preferences";

function formatMemberDate(iso: string | undefined, isDe: boolean): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(isDe ? "de-DE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage } = useDashboardLanguage();
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const copy = SETTINGS_COPY[lang];
  const { credits, creditsLoading } = useCreativeSuite();

  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [exportPref, setExportPref] = useState<ExportFormatPref | null>(null);
  const [exportSaved, setExportSaved] = useState(false);

  useEffect(() => {
    setExportPref(readExportFormatPref());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      setEmail(user.email ?? null);
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      const fullName =
        typeof meta?.full_name === "string"
          ? meta.full_name
          : typeof meta?.name === "string"
            ? meta.name
            : null;
      setDisplayName(fullName?.trim() || null);
      setMemberSince(formatMemberDate(user.created_at, isDe));
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase.auth, isDe]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function handleExportPref(next: ExportFormatPref) {
    setExportPref(next);
    writeExportFormatPref(next);
    setExportSaved(true);
    window.setTimeout(() => setExportSaved(false), 2000);
  }

  const hasCredits = !creditsLoading && credits > 0;
  const planLabel = hasCredits ? copy.plan.creditBased : copy.plan.freeExplore;
  const planDetail = hasCredits
    ? copy.plan.detailWithCredits
    : copy.plan.detailNoCredits;

  return (
    <ObsidianLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        <header className={`${OBS.glassPad} border-white/10`}>
          <p className={`${OBS.mono} text-amber-500/80`}>{copy.pageTitle}</p>
          <h1 className={`mt-2 text-3xl font-extrabold uppercase italic tracking-tight text-white sm:text-4xl`}>
            {copy.pageTitle}
          </h1>
          <p className="mt-3 text-sm text-neutral-400">{copy.pageSubtitle}</p>
        </header>

        <SettingsSection
          title={copy.profile.title}
          description={copy.profile.description}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`${OBS.mono} text-neutral-500`}>{copy.profile.email}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                <User className="h-4 w-4 shrink-0 text-amber-500/70" aria-hidden />
                {email ?? "…"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`${OBS.mono} text-neutral-500`}>
                {copy.profile.displayName}
              </p>
              <p className="mt-2 text-sm text-white/90">
                {displayName ?? copy.profile.notSet}
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title={copy.billing.title}
          description={copy.billing.description}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/dashboard/credits"
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm ${OBS.amberBtn}`}
            >
              <CreditCard className="h-4 w-4" aria-hidden />
              {copy.billing.openBilling}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-amber-500/40 hover:text-amber-300"
            >
              {copy.billing.viewPricing}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </SettingsSection>

        <SettingsSection
          title={copy.credits.title}
          description={copy.credits.description}
        >
          <div className="flex flex-col gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`${OBS.mono} text-neutral-500`}>{copy.credits.balance}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-white">
                {creditsLoading
                  ? "…"
                  : credits.toLocaleString(isDe ? "de-DE" : "en-US")}
                <span className="ml-2 text-base font-semibold text-amber-400/90">
                  Credits
                </span>
              </p>
              <p className="mt-1 text-xs text-neutral-500">{copy.credits.neverExpire}</p>
            </div>
            <Link
              href="/dashboard/credits#credit-packages"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-sm font-bold text-amber-300 transition hover:bg-amber-500/20"
            >
              {copy.credits.buyMore}
            </Link>
          </div>
        </SettingsSection>

        <SettingsSection
          title={copy.plan.title}
          description={copy.plan.description}
        >
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className={`${OBS.mono} text-neutral-500`}>{copy.plan.current}</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-4 w-4 text-amber-400" aria-hidden />
              {planLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              {planDetail}
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              {copy.plan.upgrade}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </SettingsSection>

        <SettingsSection
          title={copy.language.title}
          description={copy.language.description}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-neutral-500" aria-hidden />
            {(["en", "de"] as const).map((langCode) => (
              <button
                key={langCode}
                type="button"
                onClick={() => setLanguage(langCode)}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  language === langCode
                    ? "bg-amber-500 text-black"
                    : "border border-neutral-800 text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {langCode}
              </button>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title={copy.export.title}
          description={copy.export.description}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EXPORT_FORMAT_OPTIONS.map((option) => {
              const active = exportPref === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleExportPref(option.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                      : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20"
                  }`}
                >
                  <span className="block text-sm font-bold">
                    {option.label[lang]}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-neutral-500">
                    {option.hint[lang]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-500">
            {copy.export.placeholderNote}
          </p>
          {exportSaved ? (
            <p className="text-xs text-emerald-400/90">{copy.export.saved}</p>
          ) : null}
        </SettingsSection>

        <SettingsSection
          title={copy.privacy.title}
          description={copy.privacy.description}
        >
          <p className="text-sm leading-relaxed text-neutral-400">{copy.privacy.body}</p>
          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-400/90">
              {getTrustCommercialFaq(lang).title}
            </p>
            <TrustCommercialFaqList language={lang} variant="settings" />
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/datenschutz"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-neutral-300 transition hover:border-amber-500/35 hover:text-amber-300"
            >
              <Shield className="h-4 w-4" aria-hidden />
              {copy.privacy.privacyPolicy}
            </Link>
            <Link
              href="/#rights"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-neutral-300 transition hover:border-amber-500/35 hover:text-amber-300"
            >
              {copy.privacy.rightsFaq}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </SettingsSection>

        <SettingsSection
          title={copy.account.title}
          description={copy.account.description}
        >
          {memberSince ? (
            <p className="text-sm text-neutral-400">
              {copy.account.memberSince}:{" "}
              <span className="text-neutral-200">{memberSince}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 px-4 py-2.5 text-sm font-semibold text-neutral-400 transition hover:border-amber-500/40 hover:text-amber-400"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {copy.account.logOut}
          </button>
        </SettingsSection>
      </div>
    </ObsidianLayout>
  );
}
