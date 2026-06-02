/**
 * Server-side admin access guards — ADMIN_EMAILS never sent to the client.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function getServerSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server Components cannot mutate cookies during render.
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export function isAdminUser(user: Pick<User, "email"> | null): boolean {
  if (!user?.email) return false;
  const allowlist = parseAdminEmails();
  if (allowlist.size === 0) return false;
  return allowlist.has(user.email.toLowerCase());
}

export async function getAdminUser(): Promise<User | null> {
  const user = await getServerSessionUser();
  if (!isAdminUser(user)) return null;
  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("ADMIN_ACCESS_DENIED");
  }
  return user;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "•••@•••";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}•••@${domain}`;
}

export function maskUserId(userId: string): string {
  if (userId.length <= 8) return `${userId.slice(0, 2)}•••`;
  return `${userId.slice(0, 4)}…${userId.slice(-4)}`;
}
