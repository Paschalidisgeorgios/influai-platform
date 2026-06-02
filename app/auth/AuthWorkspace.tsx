"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import { useLanguage } from "@/hooks/useLanguage";
import {
  continuePendingPackageCheckout,
  creditsPageHref,
  getPendingPackage,
  normalizePackageKey,
  pricingPageHref,
  setPendingPackage,
} from "@/lib/billing/pending-package-checkout";
import type { PackageKey } from "@/app/lib/billing/credit-packages";
import { getCheckoutAuthCopy } from "@/lib/billing/pricing-auth-copy";

type AuthMode = "login" | "register";

const AUTH_COPY = {
  en: {
    loginTab: "Sign In",
    registerTab: "Register",
    headlineLogin: "Welcome back",
    headlineRegister: "Create your studio account",
    subtitleLogin: "Sign in to continue creating images and videos.",
    subtitleRegister: "Start with a simple idea — we'll help improve it.",
    email: "Work email",
    password: "Password",
    confirmPassword: "Confirm password",
    emailPlaceholder: "you@studio.com",
    passwordPlaceholder: "Minimum 6 characters",
    confirmPasswordPlaceholder: "Repeat your password",
    passwordMismatch: "Passwords do not match.",
    google: "Continue with Google",
    submitLogin: "Sign In",
    submitRegister: "Create Account",
    submittingLogin: "Signing in…",
    submittingRegister: "Creating account…",
    divider: "or continue with email",
    backHome: "Back to home",
    checkingSession: "Checking session…",
    successLogin: "Signed in. Opening studio…",
    successRegister: "Account created. Check your inbox or sign in.",
    secureNote: "Secure access · InfluExAI Creator Studio",
    errors: {
      oauth: "Google sign-in failed. Please try again.",
      generic: "Something went wrong. Please try again.",
      noSession: "Sign-in failed. No session was created.",
      inactivity: "You were signed out after inactivity.",
      sessionExpired: "Session expired. Please sign in again.",
    },
  },
  de: {
    loginTab: "Anmelden",
    registerTab: "Registrieren",
    headlineLogin: "Willkommen zurück",
    headlineRegister: "Studio-Konto erstellen",
    subtitleLogin: "Melde dich an, um weiter Bilder und Videos zu erstellen.",
    subtitleRegister: "Starte mit einer einfachen Idee — wir helfen beim Verfeinern.",
    email: "E-Mail",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    emailPlaceholder: "du@studio.com",
    passwordPlaceholder: "Mindestens 6 Zeichen",
    confirmPasswordPlaceholder: "Passwort wiederholen",
    passwordMismatch: "Passwörter stimmen nicht überein.",
    google: "Mit Google fortfahren",
    submitLogin: "Anmelden",
    submitRegister: "Konto erstellen",
    submittingLogin: "Anmeldung läuft…",
    submittingRegister: "Konto wird erstellt…",
    divider: "oder mit E-Mail fortfahren",
    backHome: "Zur Startseite",
    checkingSession: "Sitzung wird geprüft…",
    successLogin: "Angemeldet. Studio wird geöffnet…",
    successRegister: "Konto erstellt. Posteingang prüfen oder anmelden.",
    secureNote: "Sicherer Zugang · InfluExAI Creator Studio",
    errors: {
      oauth: "Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
      generic: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
      noSession: "Anmeldung fehlgeschlagen. Keine Sitzung erstellt.",
      inactivity: "Du wurdest nach längerer Inaktivität abgemeldet.",
      sessionExpired: "Deine Sitzung ist abgelaufen. Bitte erneut anmelden.",
    },
  },
} as const;

function InfluExLogo() {
  return (
    <div className="text-center">
      <p className="text-3xl font-black leading-none tracking-tight sm:text-4xl">
        <span className="text-white">Influ</span>
        <span className="text-amber-400">Ex</span>
        <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
          AI
        </span>
      </p>
      <p className={`mt-2 ${OBS.mono}`}>AI CREATOR STUDIO · AUTH</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.6 14.7 2.5 12 2.5 6.9 2.5 2.7 6.7 2.7 11.8S6.9 21.1 12 21.1c6.9 0 8.6-4.8 8.6-7.2 0-.5 0-1-.1-1.4H12z"
      />
    </svg>
  );
}

type AuthWorkspaceProps = {
  /** Render inside pricing/auth modal — no full-page chrome */
  embedded?: boolean;
  /** Pricing pack purchase — register-first, preserve package */
  checkoutIntent?: boolean;
  pendingPackageKey?: PackageKey;
  onClose?: () => void;
};

export default function AuthWorkspace({
  embedded = false,
  checkoutIntent = false,
  pendingPackageKey,
  onClose,
}: AuthWorkspaceProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const copy = AUTH_COPY[language];
  const checkoutCopy = getCheckoutAuthCopy(language === "de" ? "de" : "en");
  const packageFromUrl = normalizePackageKey(searchParams.get("package"));
  const isCheckoutFlow = checkoutIntent || Boolean(packageFromUrl);

  const initialMode: AuthMode = isCheckoutFlow
    ? "register"
    : searchParams.get("mode") === "register"
      ? "register"
      : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorPulse, setErrorPulse] = useState(0);

  const triggerError = useCallback((message: string) => {
    setErrorMessage(message);
    setErrorPulse((k) => k + 1);
  }, []);

  const routeAfterAuth = useCallback(
    async (accessToken: string) => {
      const pending =
        getPendingPackage() ??
        pendingPackageKey ??
        normalizePackageKey(searchParams.get("package"));

      if (pending) {
        setPendingPackage(pending);
        const result = await continuePendingPackageCheckout(accessToken);
        if (result.url) {
          window.location.href = result.url;
          return true;
        }
        const fallbackKey = result.packageKey ?? pending;
        if (embedded || isCheckoutFlow) {
          onClose?.();
          router.replace(
            embedded ? pricingPageHref(fallbackKey) : creditsPageHref(fallbackKey)
          );
          return true;
        }
        router.replace(creditsPageHref(fallbackKey));
        return true;
      }

      if (embedded) {
        onClose?.();
        return true;
      }

      router.replace("/dashboard");
      return true;
    },
    [embedded, isCheckoutFlow, onClose, pendingPackageKey, router, searchParams]
  );

  useEffect(() => {
    const fromUrl = normalizePackageKey(searchParams.get("package"));
    const key = pendingPackageKey ?? fromUrl;
    if (key) setPendingPackage(key);
  }, [searchParams, pendingPackageKey]);

  useEffect(() => {
    if (isCheckoutFlow) {
      setMode("register");
    }
  }, [isCheckoutFlow]);

  useEffect(() => {
    async function checkSessionAndParams() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          await routeAfterAuth(session.access_token);
          return;
        }

        const reason = searchParams.get("reason");
        if (reason === "inactivity") {
          setStatusMessage(copy.errors.inactivity);
        } else if (reason === "session_expired") {
          setStatusMessage(copy.errors.sessionExpired);
        }

        const oauthError = searchParams.get("error");
        if (oauthError === "oauth") {
          triggerError(copy.errors.oauth);
        }
      } finally {
        setCheckingSession(false);
      }
    }

    void checkSessionAndParams();
  }, [
    copy.errors,
    routeAfterAuth,
    searchParams,
    supabase.auth,
    triggerError,
  ]);

  useEffect(() => {
    if (isCheckoutFlow) return;
    setMode(searchParams.get("mode") === "register" ? "register" : "login");
  }, [searchParams, isCheckoutFlow]);

  useEffect(() => {
    if (mode === "login") {
      setConfirmPassword("");
    }
  }, [mode]);

  const tabs = useMemo(
    () =>
      [
        { id: "login" as const, label: copy.loginTab },
        { id: "register" as const, label: copy.registerTab },
      ] satisfies { id: AuthMode; label: string }[],
    [copy.loginTab, copy.registerTab]
  );

  async function handleGoogleSignIn() {
    try {
      setOauthLoading(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const pending =
        getPendingPackage() ??
        normalizePackageKey(searchParams.get("package"));
      if (pending) setPendingPackage(pending);

      const next = pending
        ? encodeURIComponent("/dashboard/credits?autoCheckout=1")
        : encodeURIComponent("/dashboard");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        },
      });

      if (error) triggerError(error.message);
    } catch {
      triggerError(copy.errors.generic);
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          triggerError(error.message);
          return;
        }

        if (!data.session) {
          triggerError(copy.errors.noSession);
          return;
        }

        setStatusMessage(copy.successLogin);
        await routeAfterAuth(data.session.access_token);
        return;
      }

      if (password !== confirmPassword) {
        triggerError(copy.passwordMismatch);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        triggerError(error.message);
        return;
      }

      if (data.session?.access_token) {
        setStatusMessage(copy.successLogin);
        await routeAfterAuth(data.session.access_token);
        return;
      }

      const pending =
        getPendingPackage() ??
        pendingPackageKey ??
        normalizePackageKey(searchParams.get("package"));
      if (pending) setPendingPackage(pending);

      setStatusMessage(
        isCheckoutFlow || pending
          ? checkoutCopy.successRegisterPending
          : copy.successRegister
      );
      setMode("login");
    } catch {
      triggerError(copy.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  const authCard = (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow:
              errorPulse > 0
                ? [
                    "0 0 50px rgba(0,0,0,0.8)",
                    "0 0 60px rgba(245,158,11,0.55)",
                    "0 0 50px rgba(0,0,0,0.8)",
                  ]
                : "0 0 50px rgba(0,0,0,0.8)",
            borderColor:
              errorPulse > 0
                ? ["rgba(38,38,38,0.8)", "rgba(245,158,11,0.9)", "rgba(38,38,38,0.8)"]
                : "rgba(38,38,38,0.8)",
          }}
          transition={
            errorPulse > 0
              ? { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
              : OBS_SPRING
          }
          key={errorPulse}
          className={`w-full max-w-md rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl ${
            isCheckoutFlow && embedded ? "border-0 bg-transparent p-0" : "p-6 sm:p-8"
          }`}
        >
          {!isCheckoutFlow ? <InfluExLogo /> : null}

          {checkingSession ? (
            <div className={`${isCheckoutFlow ? "mt-2" : "mt-6"} rounded-2xl border border-neutral-800/80 bg-neutral-950/40 px-4 py-3 text-sm text-neutral-400 ${OBS.mono}`}>
              {copy.checkingSession}
            </div>
          ) : null}

          {!isCheckoutFlow ? (
            <div className="mt-8 flex rounded-2xl border border-neutral-800/80 bg-neutral-950/50 p-1">
              {tabs.map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMode(tab.id);
                      setErrorMessage(null);
                      setStatusMessage(null);
                    }}
                    className={`relative flex-1 rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wider transition sm:text-sm ${
                      active ? "text-amber-400" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-xl border border-amber-500/50 bg-amber-500/10"
                        transition={OBS_SPRING}
                      />
                    ) : null}
                    <span className="relative">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {!isCheckoutFlow ? (
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-extrabold uppercase italic tracking-tight sm:text-3xl">
                {mode === "login" ? copy.headlineLogin : copy.headlineRegister}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {mode === "login" ? copy.subtitleLogin : copy.subtitleRegister}
              </p>
            </div>
          ) : null}

          {statusMessage ? (
            <p className="mt-5 rounded-2xl border border-neutral-800/80 bg-neutral-950/40 px-4 py-3 text-sm text-neutral-300">
              {statusMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            disabled={oauthLoading || loading}
            onClick={() => void handleGoogleSignIn()}
            className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-neutral-800/80 bg-neutral-950/80 text-sm font-semibold text-neutral-200 transition hover:border-amber-500/50 disabled:opacity-60"
          >
            {oauthLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            ) : (
              <GoogleIcon />
            )}
            {isCheckoutFlow ? checkoutCopy.google : copy.google}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800/80" />
            </div>
            <p className={`relative mx-auto w-fit bg-transparent px-3 ${OBS.mono} text-neutral-600`}>
              {copy.divider}
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="auth-email" className={`mb-2 block ${OBS.mono} text-neutral-500`}>
                {copy.email}
              </label>
              <div className="border-b border-neutral-800 transition focus-within:border-amber-500 focus-within:shadow-[0_1px_16px_rgba(245,158,11,0.35)]">
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  required
                  autoComplete="email"
                  className="w-full bg-transparent py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className={`mb-2 block ${OBS.mono} text-neutral-500`}>
                {copy.password}
              </label>
              <div className="border-b border-neutral-800 transition focus-within:border-amber-500 focus-within:shadow-[0_1px_16px_rgba(245,158,11,0.35)]">
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full bg-transparent py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>

            {mode === "register" ? (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className={`mb-2 block ${OBS.mono} text-neutral-500`}
                >
                  {copy.confirmPassword}
                </label>
                <div className="border-b border-neutral-800 transition focus-within:border-amber-500 focus-within:shadow-[0_1px_16px_rgba(245,158,11,0.35)]">
                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={copy.confirmPasswordPlaceholder}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
                  />
                </div>
              </div>
            ) : null}

            <motion.button
              type="submit"
              disabled={loading || oauthLoading}
              whileTap={{ scale: 0.98 }}
              transition={OBS_SPRING}
              className={`mt-2 w-full ${obsidianButtonClass("primary", {
                size: "lg",
                fullWidth: true,
                surface: "landing",
              })}`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "login"
                    ? isCheckoutFlow
                      ? checkoutCopy.submittingLogin
                      : copy.submittingLogin
                    : isCheckoutFlow
                      ? checkoutCopy.submittingRegister
                      : copy.submittingRegister}
                </>
              ) : mode === "login" ? (
                isCheckoutFlow ? checkoutCopy.submitLogin : copy.submitLogin
              ) : isCheckoutFlow ? (
                checkoutCopy.submitRegister
              ) : (
                copy.submitRegister
              )}
            </motion.button>
          </form>

          {isCheckoutFlow ? (
            <p className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setErrorMessage(null);
                  setStatusMessage(null);
                }}
                className="text-sm font-semibold text-amber-400/90 underline-offset-2 hover:text-amber-300 hover:underline"
              >
                {mode === "login"
                  ? checkoutCopy.newHere
                  : checkoutCopy.alreadyHaveAccount}
              </button>
            </p>
          ) : (
            <p className={`mt-6 text-center ${OBS.mono} text-neutral-600`}>
              {copy.secureNote}
            </p>
          )}
        </motion.div>
  );

  if (embedded) {
    return <div className="w-full text-white antialiased">{authCard}</div>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white antialiased">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_40%)]" />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 rounded-full border border-neutral-800/80 bg-neutral-900/40 px-4 py-2 text-xs font-bold text-neutral-400 backdrop-blur-xl transition hover:border-amber-500/40 hover:text-amber-400 sm:left-6 sm:top-6"
      >
        {copy.backHome}
      </Link>

      <div className="absolute right-4 top-4 z-20 flex gap-1 sm:right-6 sm:top-6">
        {(["en", "de"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${
              language === lang ? "bg-amber-500 text-black" : "text-neutral-600 hover:text-neutral-300"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20 sm:px-6">
        {authCard}
      </div>
    </main>
  );
}
