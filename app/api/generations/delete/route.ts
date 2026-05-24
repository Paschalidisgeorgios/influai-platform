import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const STORAGE_BUCKET = "generations";

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
    const generationId = body.generationId;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: "generationId is required" },
        { status: 400 }
      );
    }

    const { data: generation, error: fetchError } = await supabaseAdmin
      .from("generations")
      .select("id, user_id, image_url")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    const storagePath = getStoragePathFromPublicUrl(generation.image_url);

    if (storagePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);

        return NextResponse.json(
          { error: "Failed to delete image file" },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("generations")
      .delete()
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Generation delete error:", deleteError);

      return NextResponse.json(
        { error: "Failed to delete generation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: generationId,
    });
  } catch (error) {
    console.error("Delete generation route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}