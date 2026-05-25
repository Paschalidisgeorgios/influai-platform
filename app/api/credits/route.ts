import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return {
      user: null,
      error: "Missing authorization header",
    };
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: "Unauthorized",
    };
  }

  return {
    user,
    error: null,
  };
}

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Credits fetch error:", error);

      return NextResponse.json(
        { error: "Failed to fetch credits" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: data?.credits ?? 0,
    });
  } catch (error) {
    console.error("Credits GET route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}