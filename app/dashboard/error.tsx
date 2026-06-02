"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d8ad5f] mb-4">
          Fehler
        </p>
        <h1 className="text-2xl font-bold text-white mb-3">
          Etwas ist schiefgelaufen
        </h1>
        <p className="text-white/50 text-sm mb-8">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-[#d8ad5f] px-6 py-3 text-sm font-bold text-black hover:bg-[#efc777]"
          >
            Erneut versuchen
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
