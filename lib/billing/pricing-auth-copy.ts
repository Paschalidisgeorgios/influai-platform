import type { PackageKey } from "@/app/lib/billing/credit-packages";
import { getCreditPackageByKey } from "@/app/lib/billing/credit-packages";
export const CHECKOUT_AUTH_COPY = {
  de: {
    modalTitle: "Erstelle deinen Account, um Credits zu kaufen.",
    modalSubtitle: "Dein ausgewähltes Paket bleibt gespeichert.",
    selectedPack: (name: string, price: string) =>
      `Ausgewählt: ${name} · ${price} einmalig`,
    submitRegister: "Registrieren und fortfahren",
    submitLogin: "Anmelden und fortfahren",
    submittingRegister: "Konto wird erstellt…",
    submittingLogin: "Anmeldung läuft…",
    alreadyHaveAccount: "Ich habe bereits einen Account",
    newHere: "Noch kein Account? Registrieren",
    successRegisterPending:
      "Konto erstellt. Melde dich an, um mit deinem gespeicherten Paket fortzufahren.",
    google: "Mit Google fortfahren",
  },
  en: {
    modalTitle: "Create your account to buy credits.",
    modalSubtitle: "Your selected pack stays saved.",
    selectedPack: (name: string, price: string) =>
      `Selected: ${name} · ${price} one-time`,
    submitRegister: "Register and continue",
    submitLogin: "Sign in and continue",
    submittingRegister: "Creating account…",
    submittingLogin: "Signing in…",
    alreadyHaveAccount: "I already have an account",
    newHere: "New here? Create an account",
    successRegisterPending:
      "Account created. Sign in to continue with your saved pack.",
    google: "Continue with Google",
  },
} as const;

export function getCheckoutAuthCopy(language: "en" | "de") {
  return CHECKOUT_AUTH_COPY[language === "de" ? "de" : "en"];
}

export function formatSelectedPackLine(
  packageKey: PackageKey,
  language: "en" | "de"
): string {
  const pkg = getCreditPackageByKey(packageKey);
  const copy = getCheckoutAuthCopy(language);
  if (!pkg) return copy.modalSubtitle;
  return copy.selectedPack(pkg.label, pkg.priceLabel);
}
