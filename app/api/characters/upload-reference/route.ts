import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const STORAGE_BUCKET = "character-references";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getStoragePathFromPublicUrl(publicUrl: string) {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.slice(index + marker.length);
}

export async function POST(req: Request) {
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

    const formData = await req.formData();

    const characterId = formData.get("characterId");
    const file = formData.get("file");

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Reference image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image is too large. Max size is 8MB." },
        { status: 400 }
      );
    }

    const { data: character, error: characterError } = await supabaseAdmin
      .from("ai_characters")
      .select("id, user_id, reference_image_url")
      .eq("id", characterId)
      .eq("user_id", user.id)
      .single();

    if (characterError || !character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    if (character.reference_image_url) {
      const oldPath = getStoragePathFromPublicUrl(character.reference_image_url);

      if (oldPath) {
        const { error: removeError } = await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .remove([oldPath]);

        if (removeError) {
          console.error("Old reference image delete error:", removeError);
        }
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = file.type.includes("png")
      ? "png"
      : file.type.includes("webp")
        ? "webp"
        : "jpg";

    const filePath = `${user.id}/${characterId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Reference upload error:", uploadError);

      return NextResponse.json(
        { error: "Failed to upload reference image" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    const { data: updatedCharacter, error: updateError } = await supabaseAdmin
      .from("ai_characters")
      .update({
        reference_image_url: publicUrl,
        avatar_url: publicUrl,
      })
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

    if (updateError) {
      console.error("Reference character update error:", updateError);

      return NextResponse.json(
        { error: "Failed to update character reference" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      referenceImageUrl: publicUrl,
    });
  } catch (error) {
    console.error("Upload reference route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}