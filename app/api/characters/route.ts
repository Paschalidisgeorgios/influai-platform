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
    return { user: null, error: "Missing authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
}

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("ai_characters")
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Characters fetch error:", error);

      return NextResponse.json(
        { error: "Failed to fetch characters" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      characters: data ?? [],
    });
  } catch (error) {
    console.error("Characters GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();

    const name = body.name;
    const description = body.description ?? null;
    const appearancePrompt = body.appearancePrompt ?? null;
    const stylePrompt = body.stylePrompt ?? null;
    const gender = body.gender ?? null;
    const avatarUrl = body.avatarUrl ?? null;
    const referenceImageUrl = body.referenceImageUrl ?? null;
    const faceWorkflow = body.faceWorkflow ?? "openai";

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Character name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ai_characters")
      .insert({
        user_id: user.id,
        name,
        description,
        appearance_prompt: appearancePrompt,
        style_prompt: stylePrompt,
        gender,
        avatar_url: avatarUrl,
        reference_image_url: referenceImageUrl,
        face_workflow: faceWorkflow,
      })
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
      console.error("Character create error:", error);

      return NextResponse.json(
        { error: "Failed to create character" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      character: data,
    });
  } catch (error) {
    console.error("Characters POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}