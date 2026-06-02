import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import type {
  BrandKit,
  BrandKitFontStyle,
  BrandKitTone,
} from "@/lib/brand/brandKit";

export const runtime = "nodejs";

const FONT_STYLES: readonly BrandKitFontStyle[] = [
  "serif",
  "sans-serif",
  "display",
  "mono",
];

const TONES: readonly BrandKitTone[] = [
  "luxury",
  "minimal",
  "bold",
  "playful",
  "professional",
  "authentic",
];

function isFontStyle(value: unknown): value is BrandKitFontStyle {
  return (
    typeof value === "string" &&
    (FONT_STYLES as readonly string[]).includes(value)
  );
}

function isTone(value: unknown): value is BrandKitTone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function rowToBrandKit(row: Record<string, unknown>): BrandKit {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    workspace_id:
      row.workspace_id != null ? String(row.workspace_id) : undefined,
    name: String(row.name),
    primary_color: String(row.primary_color),
    secondary_color: String(row.secondary_color),
    accent_color: String(row.accent_color),
    font_style: row.font_style as BrandKitFontStyle,
    tone: row.tone as BrandKitTone,
    product_style: String(row.product_style ?? ""),
    visual_rules: String(row.visual_rules ?? ""),
    forbidden_elements: String(row.forbidden_elements ?? ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function GET(req: Request) {
  const { supabase, user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return NextResponse.json(
      { error: authError ?? "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("brand_kits GET error:", error);
    return NextResponse.json(
      { error: "Failed to load brand kit" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    brandKit: data ? rowToBrandKit(data as Record<string, unknown>) : null,
  });
}

export async function POST(req: Request) {
  const { supabase, user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return NextResponse.json(
      { error: authError ?? "Unauthorized" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = asString(body.name, "My Brand");
  if (!name) {
    return NextResponse.json({ error: "Kit name is required" }, { status: 400 });
  }

  const fontStyle = isFontStyle(body.font_style) ? body.font_style : "sans-serif";
  const tone = isTone(body.tone) ? body.tone : "professional";
  const now = new Date().toISOString();

  const payload = {
    user_id: user.id,
    workspace_id:
      typeof body.workspace_id === "string" ? body.workspace_id.trim() : null,
    name,
    primary_color: asString(body.primary_color, "#d8ad5f") || "#d8ad5f",
    secondary_color: asString(body.secondary_color, "#1a1a1a") || "#1a1a1a",
    accent_color: asString(body.accent_color, "#ffffff") || "#ffffff",
    font_style: fontStyle,
    tone,
    product_style: asString(body.product_style),
    visual_rules: asString(body.visual_rules),
    forbidden_elements: asString(body.forbidden_elements),
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("brand_kits")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    console.error("brand_kits POST error:", error);
    return NextResponse.json(
      { error: "Failed to save brand kit" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    brandKit: rowToBrandKit(data as Record<string, unknown>),
  });
}
