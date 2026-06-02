import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uploadGenerationFile } from "@/lib/supabase/upload-generation-file";
import { authenticateBearerToken } from "@/lib/storage/workspace-media-upload";
import {
  blockUnlessAnyToolCanRun,
  blockUnlessToolCanRun,
} from "@/app/lib/tools/tool-run-api-guard";
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function resolveUploadKind(
  type: FormDataEntryValue | null,
  slot: FormDataEntryValue | null
): "image" | "video" {
  const typeRaw = typeof type === "string" ? type.trim().toLowerCase() : "";
  if (typeRaw === "image") return "image";
  if (typeRaw === "video") return "video";

  const slotRaw = typeof slot === "string" ? slot.trim().toLowerCase() : "";
  if (slotRaw === "portrait" || slotRaw === "source") return "image";
  if (slotRaw === "driving" || slotRaw === "motion") return "video";

  return "video";
}

export async function POST(req: Request) {
  try {
    const user = await authenticateBearerToken(req.headers.get("authorization"));
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");
    const slot = formData.get("slot");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "file is required" },
        { status: 400 }
      );
    }

    const kind = resolveUploadKind(type, slot);

    const blocked =
      kind === "video"
        ? blockUnlessToolCanRun({ toolId: "motion_transfer" })
        : blockUnlessAnyToolCanRun({
            toolIds: ["motion_transfer", "ai_avatar"],
          });
    if (blocked) return blocked;
    const mime = file.type.toLowerCase();

    if (kind === "image") {
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Image is too large. Max size is 12 MB." },
          { status: 400 }
        );
      }
      if (mime && !IMAGE_MIMES.has(mime)) {
        return NextResponse.json(
          { success: false, error: "Unsupported image type. Use PNG, JPEG, or WebP." },
          { status: 400 }
        );
      }
    } else {
      if (file.size > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          { success: false, error: "Video is too large. Max size is 20 MB." },
          { status: 400 }
        );
      }
      if (mime && !VIDEO_MIMES.has(mime)) {
        return NextResponse.json(
          {
            success: false,
            error: "Unsupported video type. Use MP4, WebM, or MOV.",
          },
          { status: 400 }
        );
      }
    }

    const bucket = kind === "image" ? "reference-sources" : "generation-videos";
    const folder = kind === "image" ? "character" : "driving-video";

    const { url, path } = await uploadGenerationFile({
      supabase: supabaseAdmin,
      userId: user.id,
      file,
      bucket,
      folder,
    });

    const isPortrait = kind === "image";

    return NextResponse.json({
      success: true,
      fileUrl: url,
      storagePath: path,
      portraitUrl: isPortrait ? url : undefined,
      drivingUrl: !isPortrait ? url : undefined,
    });
  } catch (error) {
    console.error("Motion transfer upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
