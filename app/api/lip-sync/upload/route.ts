import { NextResponse } from "next/server";
import {
  authenticateBearerToken,
  uploadWorkspaceMedia,
} from "@/lib/storage/workspace-media-upload";

export const runtime = "nodejs";

const STORAGE_BUCKET = "lip-sync";

export async function POST(req: Request) {
  try {
    const user = await authenticateBearerToken(req.headers.get("authorization"));
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "file is required" },
        { status: 400 }
      );
    }

    const uploadType = type === "audio" ? "audio" : "video";
    const { publicUrl } = await uploadWorkspaceMedia({
      bucket: STORAGE_BUCKET,
      userId: user.id,
      file,
      kind: uploadType,
    });

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      sourceUrl: uploadType === "video" ? publicUrl : undefined,
      audioUrl: uploadType === "audio" ? publicUrl : undefined,
    });
  } catch (error) {
    console.error("Lip-sync upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
