"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  continuePendingPackageCheckout,
  creditsPageHref,
  getPendingPackage,
  normalizePackageKey,
  setPendingPackage,
} from "@/lib/billing/pending-package-checkout";

/**
 * After OAuth or auth redirect — resume Stripe checkout when a package was selected.
 */
export default function PendingPackageCheckoutEffect() {
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;

    const autoCheckout =
      searchParams.get("autoCheckout") === "1" ||
      searchParams.get("checkout") === "pending";
    const fromUrl = normalizePackageKey(searchParams.get("package"));
    if (fromUrl) setPendingPackage(fromUrl);
    const pending = getPendingPackage() ?? fromUrl;

    if (!autoCheckout && !pending) return;

    ran.current = true;

    async function run() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const result = await continuePendingPackageCheckout(session.access_token);
      if (result.url) {
        window.location.href = result.url;
        return;
      }

      if (result.packageKey) {
        window.location.replace(creditsPageHref(result.packageKey));
      }
    }

    void run();
  }, [searchParams]);

  return null;
}
