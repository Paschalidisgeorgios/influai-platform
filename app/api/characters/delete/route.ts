import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
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
    const characterId = body.characterId;

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("ai_characters")
      .delete()
      .eq("id", characterId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Character delete error:", error);

      return NextResponse.json(
        { error: "Failed to delete character" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: characterId,
    });
  } catch (error) {
    console.error("Character delete route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}