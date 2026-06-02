export type BrandKitFontStyle = "serif" | "sans-serif" | "display" | "mono";
export type BrandKitTone =
  | "luxury"
  | "minimal"
  | "bold"
  | "playful"
  | "professional"
  | "authentic";

export type BrandKit = {
  id: string;
  user_id: string;
  workspace_id?: string | null;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_style: BrandKitFontStyle;
  tone: BrandKitTone;
  product_style: string;
  visual_rules: string;
  forbidden_elements: string;
  created_at: string;
  updated_at: string;
};

const TONE_MAP: Record<BrandKitTone, string> = {
  luxury:
    "premium luxury aesthetic, high-end editorial look, sophisticated mood",
  minimal: "clean minimal design, white space, precise composition",
  bold: "bold strong visuals, high contrast, confident energy",
  playful: "fun energetic mood, vibrant colors, dynamic composition",
  professional:
    "professional corporate aesthetic, clean trustworthy look",
  authentic:
    "authentic real-world feel, organic natural style, UGC energy",
};

export function buildBrandKitPromptBlock(kit: BrandKit): string {
  const parts: string[] = [];

  parts.push(`Brand Kit Active: ${kit.name}`);

  if (kit.primary_color) {
    parts.push(
      `Brand Colors: Primary ${kit.primary_color}, Secondary ${kit.secondary_color}, Accent ${kit.accent_color}`
    );
  }

  parts.push(`Brand Tone: ${TONE_MAP[kit.tone]}`);

  if (kit.product_style.trim()) {
    parts.push(`Product Style: ${kit.product_style.trim()}`);
  }
  if (kit.visual_rules.trim()) {
    parts.push(`Visual Rules: ${kit.visual_rules.trim()}`);
  }
  if (kit.forbidden_elements.trim()) {
    parts.push(`Strictly avoid: ${kit.forbidden_elements.trim()}`);
  }

  return parts.join("\n");
}

export function applyBrandKitToPrompt(
  prompt: string,
  kit: BrandKit | null | undefined
): string {
  const trimmed = prompt.trim();
  if (!kit?.name?.trim()) return trimmed;
  const block = buildBrandKitPromptBlock(kit);
  if (!trimmed) return block;
  return `${block}\n\n${trimmed}`;
}
