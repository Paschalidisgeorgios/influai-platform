import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const AUDIO_BUCKET = "lip-sync-audio";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const ALLOWED_AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/webm",
]);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function resolveAudioExtension(file: File): string {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime === "audio/wav" || mime === "audio/x-wav" || name.endsWith(".wav")) {
    return "wav";
  }
  if (mime === "audio/aac" || name.endsWith(".aac")) return "aac";
  if (mime === "audio/webm" || name.endsWith(".webm")) return "webm";
  if (mime === "audio/mp4" || name.endsWith(".m4a") || name.endsWith(".mp4")) {
    return name.endsWith(".m4a") ? "m4a" : "mp4";
  }
  return "mp3";
}

function contentTypeForAudioExtension(ext: string): string {
  if (ext === "wav") return "audio/wav";
  if (ext === "aac") return "audio/aac";
  if (ext === "webm") return "audio/webm";
  if (ext === "m4a" || ext === "mp4") return "audio/mp4";
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

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const mime = file.type.toLowerCase();
    const nameAllowed = /\.(mp3|wav|aac|m4a|mp4|webm)$/i.test(file.name);

    if ((mime && !ALLOWED_AUDIO_MIME.has(mime)) && !nameAllowed) {
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

    const extension = resolveAudioExtension(file);
    const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const contentType = contentTypeForAudioExtension(extension);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(AUDIO_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Lip sync audio upload error:", {
        bucket: AUDIO_BUCKET,
        storagePath,
        mime,
        size: file.size,
        message: uploadError.message,
      });

      const userMessage =
        uploadError.message?.includes("Bucket not found") ||
        uploadError.message?.includes("bucket")
          ? `Storage bucket "${AUDIO_BUCKET}" is not available. Check Supabase storage setup.`
          : uploadError.message || "Failed to upload file.";

      return NextResponse.json({ error: userMessage }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(AUDIO_BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      storagePath,
    });
  } catch (error) {
    console.error("Lip sync audio upload route error:", error);

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}

