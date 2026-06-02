import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: creditsError } = await supabaseAdmin
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .maybeSingle();

  if (creditsError) {
    return NextResponse.json(
      { error: "Failed to load credits" },
      { status: 500 }
    );
  }

  return NextResponse.json({ credits: data?.credits ?? 0 });
}
