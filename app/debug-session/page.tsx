"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type DebugState = {
  hasSession: boolean;
  hasUser: boolean;
  email: string | null;
  accessTokenStart: string | null;
  error: string | null;
};

export default function DebugSessionPage() {
  const supabase = createClient();

  const [debug, setDebug] = useState<DebugState | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        setDebug({
          hasSession: Boolean(session),
          hasUser: Boolean(session?.user),
          email: session?.user?.email ?? null,
          accessTokenStart: session?.access_token
            ? session.access_token.slice(0, 20)
            : null,
          error: error?.message ?? null,
        });
      } catch (error) {
        setDebug({
          hasSession: false,
          hasUser: false,
          email: null,
          accessTokenStart: null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    checkSession();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h1 className="text-3xl font-black">Session Debug</h1>

        {!debug ? (
          <p className="text-white/60">Checking session...</p>
        ) : (
          <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white">
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}

        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black"
          >
            Login
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}