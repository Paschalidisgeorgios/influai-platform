import { NextResponse } from "next/server";
import { isKreaEnabled } from "@/lib/providers/krea";

export const runtime = "nodejs";

function hasKreaApiKey(): boolean {
  return Boolean(process.env.KREA_API_KEY?.trim());
}

export async function GET() {
  const enabled = isKreaEnabled();

  if (!enabled) {
    return NextResponse.json(
      {
        success: false,
        provider: "krea",
        enabled: false,
        configured: true,
        error: "Krea provider is disabled",
      },
      { status: 503 }
    );
  }

  if (!hasKreaApiKey()) {
    return NextResponse.json(
      {
        success: false,
        provider: "krea",
        enabled: true,
        configured: false,
        error: "KREA_API_KEY is not configured",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    provider: "krea",
    enabled: true,
    configured: true,
  });
}
