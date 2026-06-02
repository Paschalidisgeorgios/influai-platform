"use client";

import { Suspense } from "react";
import type { PackageKey } from "@/app/lib/billing/credit-packages";
import {
  formatSelectedPackLine,
  getCheckoutAuthCopy,
} from "@/lib/billing/pricing-auth-copy";
import AuthWorkspace from "@/app/auth/AuthWorkspace";
import ObsidianModalShell from "./ObsidianModalShell";

type Props = {
  open: boolean;
  onClose: () => void;
  packageKey: PackageKey | null;
  language: "en" | "de";
};

export default function AuthCheckoutModal({
  open,
  onClose,
  packageKey,
  language,
}: Props) {
  const lang = language === "de" ? "de" : "en";
  const copy = getCheckoutAuthCopy(lang);

  return (
    <ObsidianModalShell
      open={open}
      onClose={onClose}
      title={copy.modalTitle}
      size="md"
    >
      <p className="text-sm leading-relaxed text-neutral-400">{copy.modalSubtitle}</p>
      {packageKey ? (
        <p className="mt-2 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
          {formatSelectedPackLine(packageKey, lang)}
        </p>
      ) : null}

      <div className="mt-4">
        <Suspense
          fallback={
            <p className="text-sm text-neutral-500">
              {lang === "de" ? "Laden…" : "Loading…"}
            </p>
          }
        >
          <AuthWorkspace
            embedded
            checkoutIntent
            pendingPackageKey={packageKey ?? undefined}
            onClose={onClose}
          />
        </Suspense>
      </div>
    </ObsidianModalShell>
  );
}
