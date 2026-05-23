import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase admin is not configured");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function authenticateBearerUser(
  req: Request
) {
  const supabase = getSupabaseAdmin();

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return { supabase, user: null, error: "Unauthorized" as const };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { supabase, user: null, error: "Invalid session" as const };
  }

  return { supabase, user, error: null };
}
