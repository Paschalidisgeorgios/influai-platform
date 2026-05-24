import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const generationId = body.generationId;
    const isFavorite = body.isFavorite;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: "generationId is required" },
        { status: 400 }
      );
    }

    if (typeof isFavorite !== "boolean") {
      return NextResponse.json(
        { error: "isFavorite must be boolean" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generations")
      .update({ is_favorite: isFavorite })
      .eq("id", generationId)
      .eq("user_id", user.id)
      .select("id, is_favorite")
      .single();

    if (error) {
      console.error("Favorite update error:", error);

      return NextResponse.json(
        { error: "Failed to update favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      generation: data,
    });
  } catch (error) {
    console.error("Favorite route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}