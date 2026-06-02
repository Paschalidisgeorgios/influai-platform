import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { blockUnlessReferenceUploadAllowed } from "@/app/lib/tools/tool-run-api-guard";

export const runtime = "nodejs";

const STORAGE_BUCKET = "reference-sources";
const MAX_FILE_BYTES = 12 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function resolveExtension(file: File): "png" | "jpg" | "webp" | null {
  const mime = file.type.toLowerCase();

  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";

  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";

  return null;
}

export async function POST(req: Request) {
  try {
    const blocked = blockUnlessReferenceUploadAllowed();
    if (blocked) return blocked;

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
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const extension = resolveExtension(file);
    const mime = file.type.toLowerCase();

    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPEG, or WebP." },
        { status: 400 }
      );
    }

    if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPEG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Max size is 12 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const contentType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Reference source upload error:", uploadError);

      return NextResponse.json(
        { error: "Failed to upload source image." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      storagePath,
    });
  } catch (error) {
    console.error("Reference source upload route error:", error);

    return NextResponse.json(
      { error: "Failed to upload source image." },
      { status: 500 }
    );
  }
}
