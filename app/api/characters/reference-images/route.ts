import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { blockUnlessTrainingUploadAllowed } from "@/app/lib/tools/tool-run-api-guard";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = "character-references";

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

function getFileExtension(file: File) {
  const contentType = file.type;

  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/jpg") return "jpg";

  return "jpg";
}

async function verifyCharacterOwner({
  userId,
  characterId,
}: {
  userId: string;
  characterId: string;
}) {
  const { data: character, error } = await supabaseAdmin
    .from("ai_characters")
    .select("id, user_id, reference_image_url")
    .eq("id", characterId)
    .eq("user_id", userId)
    .single();

  if (error || !character) {
    return null;
  }

  return character;
}

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    const character = await verifyCharacterOwner({
      userId: user.id,
      characterId,
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const { data: images, error } = await supabaseAdmin
      .from("ai_character_reference_images")
      .select(
        `
        id,
        user_id,
        character_id,
        image_url,
        storage_path,
        sort_order,
        is_primary,
        created_at
      `
      )
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("is_primary", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Reference images fetch error:", error);

      return NextResponse.json(
        { error: "Failed to fetch reference images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: images ?? [],
    });
  } catch (error) {
    console.error("Reference images GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const blocked = blockUnlessTrainingUploadAllowed();
    if (blocked) return blocked;

    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const formData = await req.formData();

    const characterId = formData.get("characterId");
    const file = formData.get("file");
    const requestedPrimary = formData.get("isPrimary");

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const maxSizeMb = 12;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `Image is too large. Max ${maxSizeMb}MB.` },
        { status: 400 }
      );
    }

    const character = await verifyCharacterOwner({
      userId: user.id,
      characterId,
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const { count: existingCount, error: countError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("character_id", characterId);

    if (countError) {
      console.error("Reference image count error:", countError);

      return NextResponse.json(
        { error: "Failed to check reference images" },
        { status: 500 }
      );
    }

    const shouldBePrimary =
      requestedPrimary === "true" || !existingCount || existingCount === 0;

    const extension = getFileExtension(file);
    const storagePath = `${user.id}/${characterId}/${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Reference image upload error:", uploadError);

      return NextResponse.json(
        { error: "Failed to upload reference image" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    if (shouldBePrimary) {
      const { error: unsetPrimaryError } = await supabaseAdmin
        .from("ai_character_reference_images")
        .update({
          is_primary: false,
        })
        .eq("user_id", user.id)
        .eq("character_id", characterId);

      if (unsetPrimaryError) {
        console.error("Unset primary reference error:", unsetPrimaryError);
      }
    }

    const { data: referenceImage, error: insertError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .insert({
        user_id: user.id,
        character_id: characterId,
        image_url: publicUrl,
        storage_path: storagePath,
        sort_order: existingCount ?? 0,
        is_primary: shouldBePrimary,
      })
      .select(
        `
        id,
        user_id,
        character_id,
        image_url,
        storage_path,
        sort_order,
        is_primary,
        created_at
      `
      )
      .single();

    if (insertError || !referenceImage) {
      console.error("Reference image insert error:", insertError);

      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);

      return NextResponse.json(
        { error: "Failed to save reference image" },
        { status: 500 }
      );
    }

    if (shouldBePrimary) {
      const { error: updateCharacterError } = await supabaseAdmin
        .from("ai_characters")
        .update({
          reference_image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", characterId)
        .eq("user_id", user.id);

      if (updateCharacterError) {
        console.error(
          "Character primary reference update error:",
          updateCharacterError
        );
      }
    }

    return NextResponse.json({
      success: true,
      image: referenceImage,
    });
  } catch (error) {
    console.error("Reference images POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();

    const referenceImageId = body.referenceImageId;

    if (!referenceImageId || typeof referenceImageId !== "string") {
      return NextResponse.json(
        { error: "referenceImageId is required" },
        { status: 400 }
      );
    }

    const { data: referenceImage, error: fetchError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .select("id, character_id, image_url")
      .eq("id", referenceImageId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !referenceImage) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 404 }
      );
    }

    const character = await verifyCharacterOwner({
      userId: user.id,
      characterId: referenceImage.character_id,
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const { error: unsetError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .update({
        is_primary: false,
      })
      .eq("user_id", user.id)
      .eq("character_id", referenceImage.character_id);

    if (unsetError) {
      console.error("Unset primary references error:", unsetError);

      return NextResponse.json(
        { error: "Failed to update primary reference" },
        { status: 500 }
      );
    }

    const { error: setPrimaryError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .update({
        is_primary: true,
      })
      .eq("id", referenceImageId)
      .eq("user_id", user.id);

    if (setPrimaryError) {
      console.error("Set primary reference error:", setPrimaryError);

      return NextResponse.json(
        { error: "Failed to set primary reference" },
        { status: 500 }
      );
    }

    const { error: updateCharacterError } = await supabaseAdmin
      .from("ai_characters")
      .update({
        reference_image_url: referenceImage.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", referenceImage.character_id)
      .eq("user_id", user.id);

    if (updateCharacterError) {
      console.error("Character reference update error:", updateCharacterError);

      return NextResponse.json(
        { error: "Failed to update character reference" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      primaryReferenceImageId: referenceImageId,
    });
  } catch (error) {
    console.error("Reference images PATCH error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();

    const referenceImageId = body.referenceImageId;

    if (!referenceImageId || typeof referenceImageId !== "string") {
      return NextResponse.json(
        { error: "referenceImageId is required" },
        { status: 400 }
      );
    }

    const { data: referenceImage, error: fetchError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .select("id, character_id, storage_path, is_primary")
      .eq("id", referenceImageId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !referenceImage) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 404 }
      );
    }

    const character = await verifyCharacterOwner({
      userId: user.id,
      characterId: referenceImage.character_id,
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const { error: deleteDbError } = await supabaseAdmin
      .from("ai_character_reference_images")
      .delete()
      .eq("id", referenceImageId)
      .eq("user_id", user.id);

    if (deleteDbError) {
      console.error("Reference image DB delete error:", deleteDbError);

      return NextResponse.json(
        { error: "Failed to delete reference image" },
        { status: 500 }
      );
    }

    if (referenceImage.storage_path) {
      const { error: storageDeleteError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([referenceImage.storage_path]);

      if (storageDeleteError) {
        console.error("Reference image storage delete error:", storageDeleteError);
      }
    }

    if (referenceImage.is_primary) {
      const { data: nextPrimary, error: nextPrimaryError } = await supabaseAdmin
        .from("ai_character_reference_images")
        .select("id, image_url")
        .eq("user_id", user.id)
        .eq("character_id", referenceImage.character_id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextPrimaryError) {
        console.error("Next primary fetch error:", nextPrimaryError);
      }

      if (nextPrimary) {
        await supabaseAdmin
          .from("ai_character_reference_images")
          .update({
            is_primary: true,
          })
          .eq("id", nextPrimary.id)
          .eq("user_id", user.id);

        await supabaseAdmin
          .from("ai_characters")
          .update({
            reference_image_url: nextPrimary.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", referenceImage.character_id)
          .eq("user_id", user.id);
      } else {
        await supabaseAdmin
          .from("ai_characters")
          .update({
            reference_image_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", referenceImage.character_id)
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      deletedReferenceImageId: referenceImageId,
    });
  } catch (error) {
    console.error("Reference images DELETE error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}