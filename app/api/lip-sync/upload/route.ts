import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/** Lip-sync source videos use the same bucket as generated campaign videos. */
const SOURCE_VIDEO_BUCKET = "generation-videos";
/** Legacy bucket for image sources if ever uploaded via this route. */
const SOURCE_IMAGE_BUCKET = "lip-sync-sources";
const AUDIO_BUCKET = "lip-sync-audio";

const MAX_SOURCE_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const SOURCE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/webm",
  "audio/ogg",
  "audio/x-m4a",
]);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type UploadKind = "source" | "audio";

function resolveSourceKind(file: File): "image" | "video" | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (
    mime.startsWith("image/") ||
    /\.(png|jpe?g|webp)$/i.test(name)
  ) {
    if (
      mime === "image/png" ||
      mime === "image/jpeg" ||
      mime === "image/jpg" ||
      mime === "image/webp" ||
      /\.(png|jpe?g|webp)$/i.test(name)
    ) {
      return "image";
    }
  }

  if (
    mime.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(name)
  ) {
    return "video";
  }

  return null;
}

function resolveExtension(file: File, kind: UploadKind): string | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (kind === "source") {
    const sourceKind = resolveSourceKind(file);
    if (sourceKind === "image") {
      if (mime === "image/png" || name.endsWith(".png")) return "png";
      if (mime === "image/webp" || name.endsWith(".webp")) return "webp";
      return "jpg";
    }
    if (sourceKind === "video") {
      if (mime === "video/webm" || name.endsWith(".webm")) return "webm";
      if (mime === "video/quicktime" || name.endsWith(".mov")) return "mov";
      return "mp4";
    }
    return null;
  }

  if (mime === "audio/wav" || mime === "audio/x-wav" || name.endsWith(".wav")) {
    return "wav";
  }
  if (mime === "audio/ogg" || name.endsWith(".ogg")) return "ogg";
  if (mime === "audio/aac" || name.endsWith(".aac")) return "aac";
  if (mime === "audio/mp4" || mime === "audio/x-m4a" || name.endsWith(".m4a")) {
    return "m4a";
  }
  return "mp3";
}

function contentTypeForExtension(ext: string, kind: UploadKind): string {
  if (kind === "source") {
    if (ext === "png") return "image/png";
    if (ext === "webp") return "image/webp";
    if (ext === "webm") return "video/webm";
    if (ext === "mov") return "video/quicktime";
    if (ext === "jpg") return "image/jpeg";
    return "video/mp4";
  }

  if (ext === "wav") return "audio/wav";
  if (ext === "ogg") return "audio/ogg";
  if (ext === "aac") return "audio/aac";
  if (ext === "m4a") return "audio/mp4";
  return "audio/mpeg";
}

export async function POST(req: Request) {
  try {
    if (process.env.ENABLE_FAL_LIP_SYNC !== "true") {
      return NextResponse.json(
        { error: "Lip Sync Studio is not enabled on the server." },
        { status: 400 }
      );
    }

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
    const typeRaw = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const uploadType =
      typeRaw === "source" || typeRaw === "audio" ? (typeRaw as UploadKind) : null;

    if (!uploadType) {
      return NextResponse.json(
        { error: 'type is required ("source" or "audio")' },
        { status: 400 }
      );
    }

    const extension = resolveExtension(file, uploadType);

    if (!extension) {
      return NextResponse.json(
        {
          error:
            uploadType === "source"
              ? "Unsupported source file. Use PNG, JPEG, WebP, MP4, WebM, or MOV."
              : "Unsupported audio file. Use MP3, WAV, AAC, OGG, or M4A.",
        },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();

    if (uploadType === "source") {
      if (mime && !SOURCE_MIME.has(mime) && !resolveSourceKind(file)) {
        return NextResponse.json(
          { error: "Unsupported source file type." },
          { status: 400 }
        );
      }

      if (file.size > MAX_SOURCE_BYTES) {
        return NextResponse.json(
          { error: "Source file is too large. Max size is 50 MB." },
          { status: 400 }
        );
      }
    } else {
      if (mime && !AUDIO_MIME.has(mime) && !/\.(mp3|wav|aac|ogg|m4a)$/i.test(file.name)) {
        return NextResponse.json(
          { error: "Unsupported audio file type." },
          { status: 400 }
        );
      }

      if (file.size > MAX_AUDIO_BYTES) {
        return NextResponse.json(
          { error: "Audio file is too large. Max size is 25 MB." },
          { status: 400 }
        );
      }
    }

    const sourceKind = uploadType === "source" ? resolveSourceKind(file) : null;
    const bucket =
      uploadType === "audio"
        ? AUDIO_BUCKET
        : sourceKind === "video"
          ? SOURCE_VIDEO_BUCKET
          : SOURCE_IMAGE_BUCKET;
    const storagePath = `${user.id}/lip-sync/${crypto.randomUUID()}.${extension}`;
    const contentType = contentTypeForExtension(extension, uploadType);
    const fileType =
      uploadType === "audio"
        ? "audio"
        : sourceKind === "video"
          ? "video"
          : "image";

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Lip sync upload error:", {
        bucket,
        storagePath,
        uploadType,
        fileType,
        mime,
        size: file.size,
        message: uploadError.message,
      });

      const userMessage =
        uploadError.message?.includes("Bucket not found") ||
        uploadError.message?.includes("bucket")
          ? `Storage bucket "${bucket}" is not available. Check Supabase storage setup.`
          : uploadError.message || "Failed to upload file.";

      return NextResponse.json({ error: userMessage }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      storagePath,
      fileType,
    });
  } catch (error) {
    console.error("Lip sync upload route error:", error);

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
