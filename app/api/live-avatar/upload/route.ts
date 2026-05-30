import { NextResponse } from "next/server";
import {
  authenticateBearerToken,
  uploadWorkspaceMedia,
} from "@/lib/storage/workspace-media-upload";

export const runtime = "nodejs";

const STORAGE_BUCKET = "motion-transfer";

export async function POST(req: Request) {
  try {
    const user = await authenticateBearerToken(req.headers.get("authorization"));
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const slot = formData.get("slot");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "file is required" },
        { status: 400 }
      );
    }

    const { publicUrl } = await uploadWorkspaceMedia({
      bucket: STORAGE_BUCKET,
      userId: user.id,
      file,
      kind: "video",
    });

    const isPortrait = slot === "portrait" || slot === "source";

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      portraitUrl: isPortrait ? publicUrl : undefined,
      drivingUrl: !isPortrait ? publicUrl : undefined,
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
