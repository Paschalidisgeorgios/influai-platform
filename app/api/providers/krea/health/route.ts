import { NextResponse } from "next/server";
import { isKreaEnabled } from "@/lib/providers/krea-workflows";

export const runtime = "nodejs";

const KREA_API_BASE =
  process.env.KREA_API_BASE_URL?.trim() || "https://api.krea.ai";

export async function GET() {
  try {
    const apiKey = process.env.KREA_API_KEY?.trim();
    const imageModel =
      process.env.KREA_IMAGE_MODEL_PATH?.trim() || "bfl/flux-1-dev";
    const videoModel =
      process.env.KREA_MODEL_VIDEO?.trim() || "kling/kling-3.0";

    if (!apiKey) {
      return NextResponse.json({
        status: "unconfigured",
        provider: "krea",
      });
    }

    if (!isKreaEnabled()) {
      return NextResponse.json({
        status: "error",
        provider: "krea",
        message: "Krea provider is disabled",
      });
    }

    const ping = await fetch(`${KREA_API_BASE}/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (ping.status === 401 || ping.status === 403) {
      return NextResponse.json(
        {
          status: "error",
          provider: "krea",
          message: "Krea API rejected the API key",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      provider: "krea",
      model: imageModel,
      videoModel,
      apiReachable: ping.status < 500,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea health check failed";
    return NextResponse.json(
      { status: "error", provider: "krea", message },
      { status: 500 }
    );
  }
}
