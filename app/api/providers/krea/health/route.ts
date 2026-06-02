import { NextResponse } from "next/server";
import { isProductionRuntime } from "@/lib/env/runtime-ui";
import { isKreaEnabled } from "@/lib/providers/krea";

export const runtime = "nodejs";

function hasKreaApiKey(): boolean {
  return Boolean(process.env.KREA_API_KEY?.trim());
}

export async function GET() {
  if (isProductionRuntime()) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const enabled = isKreaEnabled();

  if (!enabled) {
    return NextResponse.json(
      {
        success: false,
        provider: "krea",
        enabled: false,
        configured: true,
        error: "Krea provider is disabled",
        nodeEnv: process.env.NODE_ENV ?? null,
        vercelEnv: process.env.VERCEL_ENV ?? null,
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
        nodeEnv: process.env.NODE_ENV ?? null,
        vercelEnv: process.env.VERCEL_ENV ?? null,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    provider: "krea",
    enabled: true,
    configured: true,
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
