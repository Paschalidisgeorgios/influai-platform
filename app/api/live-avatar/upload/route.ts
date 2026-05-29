import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isLiveAvatarEnabled } from "@/lib/providers/live-avatar";

export const runtime = "nodejs";

/** Creator portrait → reference-sources bucket. */
const IMAGE_BUCKET = "reference-sources";
/** Driving motion video → shared generation-videos bucket. */
const VIDEO_BUCKET = "generation-videos";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type UploadKind = "image" | "video";

function resolveImageExtension(file: File): "png" | "jpg" | "webp" | null {
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

function resolveVideoExtension(file: File): "mp4" | "webm" | "mov" | null {
  const mime = file.type.toLowerCase();
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  if (mime === "video/mp4") return "mp4";

  const name = file.name.toLowerCase();
  if (name.endsWith(".webm")) return "webm";
  if (name.endsWith(".mov")) return "mov";
  if (name.endsWith(".mp4")) return "mp4";

  return null;
}

function imageContentType(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function videoContentType(ext: string): string {
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
}

export async function POST(req: Request) {
  try {
    if (!isLiveAvatarEnabled()) {
      return NextResponse.json(
        { success: false, error: "This feature is currently disabled.", comingSoon: true },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const typeRaw = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "file is required" },
        { status: 400 }
      );
    }

    const uploadType: UploadKind | null =
      typeRaw === "image" || typeRaw === "video" ? (typeRaw as UploadKind) : null;

    if (!uploadType) {
      return NextResponse.json(
        { success: false, error: 'type is required ("image" or "video")' },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();

    if (uploadType === "image") {
      const extension = resolveImageExtension(file);

      if (!extension || (mime && !IMAGE_MIME.has(mime))) {
        return NextResponse.json(
          { success: false, error: "Unsupported image. Use PNG, JPEG or WebP." },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Image is too large. Max size is 12 MB." },
          { status: 400 }
        );
      }

      const storagePath = `${user.id}/live-avatar/${crypto.randomUUID()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseAdmin.storage
        .from(IMAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: imageContentType(extension),
          upsert: false,
        });

      if (uploadError) {
        console.error("Live Avatar image upload error:", uploadError.message);
        const userMessage = uploadError.message?.toLowerCase().includes("bucket")
          ? `Storage bucket "${IMAGE_BUCKET}" is not available.`
          : "Failed to upload image.";
        return NextResponse.json(
          { success: false, error: userMessage },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath);

      return NextResponse.json({
        success: true,
        fileUrl: publicUrl,
        storagePath,
        fileType: "image",
      });
    }

    const extension = resolveVideoExtension(file);

    if (!extension || (mime && !VIDEO_MIME.has(mime))) {
      return NextResponse.json(
        { success: false, error: "Unsupported video. Use MP4, WebM or MOV." },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { success: false, error: "Video is too large. Max size is 50 MB." },
        { status: 400 }
      );
    }

    const storagePath = `${user.id}/live-avatar/${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(VIDEO_BUCKET)
      .upload(storagePath, buffer, {
        contentType: videoContentType(extension),
        upsert: false,
      });

    if (uploadError) {
      console.error("Live Avatar video upload error:", uploadError.message);
      const userMessage = uploadError.message?.toLowerCase().includes("bucket")
        ? `Storage bucket "${VIDEO_BUCKET}" is not available.`
        : "Failed to upload video.";
      return NextResponse.json(
        { success: false, error: userMessage },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(VIDEO_BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      storagePath,
      fileType: "video",
    });
  } catch (error) {
    console.error("Live Avatar upload route error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
