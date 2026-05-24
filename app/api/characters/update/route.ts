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

    const characterId = body.characterId;
    const name = body.name;
    const description = body.description ?? null;
    const appearancePrompt = body.appearancePrompt ?? null;
    const stylePrompt = body.stylePrompt ?? null;
    const gender = body.gender ?? null;
    const faceWorkflow = body.faceWorkflow ?? undefined;

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Character name is required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, string | null> = {
      name,
      description,
      appearance_prompt: appearancePrompt,
      style_prompt: stylePrompt,
      gender,
    };

    if (typeof faceWorkflow === "string") {
      updatePayload.face_workflow = faceWorkflow;
    }

    const { data, error } = await supabaseAdmin
      .from("ai_characters")
      .update(updatePayload)
      .eq("id", characterId)
      .eq("user_id", user.id)
      .select(
        `
        id,
        name,
        description,
        appearance_prompt,
        style_prompt,
        gender,
        avatar_url,
        reference_image_url,
        face_workflow,
        created_at
      `
      )
      .single();

    if (error) {
      console.error("Character update error:", error);

      return NextResponse.json(
        { error: "Failed to update character" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      character: data,
    });
  } catch (error) {
    console.error("Character update route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}