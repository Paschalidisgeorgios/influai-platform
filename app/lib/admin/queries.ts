/**
 * Admin console read-only data queries — server-only.
 */

import { getAdminActionMetadata } from "@/app/lib/actions/resolve-action";
import { getAllEngines } from "@/app/lib/engines/catalog";
import { getSupabaseAdmin } from "@/app/lib/supabase-admin";
import { parseStoredGenerationError } from "@/lib/generation/generation-errors";
import { maskEmail, maskUserId } from "./guards";

export type AdminEngineRow = {
  engineId: string;
  group: string;
  provider: string;
  outputType: string;
  status: string;
  credits: number;
  validationStatus: string;
  canShowToUser: boolean;
  canRunGeneration: boolean;
  requiredEnvVars: string[];
  modelId: string | null;
};

export type AdminActionRow = {
  actionId: string;
  label: string;
  outputType: string;
  status: string;
  defaultEngine: string | null;
  allowedEngines: string[];
  estimatedCredits: number;
  visibleToUser: boolean;
};

export type AdminGenerationJobRow = {
  id: string;
  createdAt: string;
  userLabel: string;
  actionId: string;
  engineId: string;
  outputType: "image" | "video" | "other";
  status: string;
  creditsCharged: number;
  creditsRefunded: number | null;
  hasAssetUrl: boolean;
  errorMessage: string | null;
};

export type AdminCreditEventRow = {
  id: string;
  userLabel: string;
  amount: number;
  type: string;
  reason: string;
  relatedGenerationId: string | null;
  createdAt: string;
};

function defaultRequiredEnv(provider: string): string[] {
  if (provider === "krea") return ["KREA_API_KEY", "ENABLE_KREA_PROVIDER"];
  if (provider === "fal") return ["FAL_KEY", "ENABLE_FAL_PROVIDER"];
  return [];
}

export function getAdminEngineRegistryRows(): AdminEngineRow[] {
  return getAllEngines().map((entry) => ({
    engineId: entry.id,
    group: entry.group ?? "—",
    provider: entry.provider,
    outputType: entry.outputType,
    status: entry.status,
    credits: entry.credits,
    validationStatus: entry.validation?.validationStatus ?? "not_tested",
    canShowToUser: entry.canShowToUser ?? false,
    canRunGeneration: entry.canRunGeneration ?? false,
    requiredEnvVars:
      entry.requiresServerEnv?.length
        ? [...entry.requiresServerEnv]
        : defaultRequiredEnv(entry.provider),
    modelId:
      entry.model ??
      entry.falRegistryId ??
      entry.kreaRegistryId ??
      entry.kreaStudioId ??
      null,
  }));
}

export function getAdminActionRegistryRows(): AdminActionRow[] {
  return getAdminActionMetadata().map((action) => ({
    actionId: action.id,
    label: action.label,
    outputType: action.outputType,
    status: action.status,
    defaultEngine: action.defaultEngine ?? null,
    allowedEngines: action.allowedEngines ? [...action.allowedEngines] : [],
    estimatedCredits: action.minCredits,
    visibleToUser: action.clientVisible,
  }));
}

function inferEngineId(model: string | null): string {
  if (!model) return "—";
  for (const engine of getAllEngines()) {
    if (
      engine.id === model ||
      engine.kreaRegistryId === model ||
      engine.falRegistryId === model ||
      engine.kreaStudioId === model ||
      engine.model === model
    ) {
      return engine.id;
    }
  }
  return model;
}

function inferActionId(params: {
  workflow: string | null;
  provider: string | null;
  model: string | null;
  hasVideo: boolean;
}): string {
  if (params.hasVideo) return "create_video";
  if (params.provider === "fal") return "create_video";
  if (params.workflow?.includes("style")) return "create_style_variant";
  if (params.workflow?.includes("krea_image") || params.provider === "krea") {
    return "create_image";
  }
  if (params.workflow) return params.workflow;
  return "—";
}

function inferOutputType(params: {
  workflow: string | null;
  hasVideo: boolean;
  hasImage: boolean;
}): "image" | "video" | "other" {
  if (params.hasVideo) return "video";
  if (params.workflow?.includes("video")) return "video";
  if (params.hasImage) return "image";
  return "other";
}

function shortenInternalError(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const parsed = parseStoredGenerationError(raw);
  const code = parsed?.code ?? null;
  const message = parsed?.error ?? parsed?.reason ?? raw;
  const sanitized = message
    .replace(/fal\.ai|fal-ai|krea\.ai|KREA_API_KEY|FAL_KEY/gi, "[provider]")
    .slice(0, 160);
  return code ? `${code}: ${sanitized}` : sanitized;
}

function extractGenerationIdFromSource(source: string | null): string | null {
  if (!source) return null;
  const uuidMatch = source.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
  );
  return uuidMatch?.[0] ?? null;
}

async function resolveUserLabels(
  userIds: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const labels = new Map<string, string>();
  if (!unique.length) return labels;

  const supabase = getSupabaseAdmin();
  await Promise.all(
    unique.map(async (userId) => {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (!error && data.user?.email) {
          labels.set(userId, maskEmail(data.user.email));
          return;
        }
      } catch {
        // Fall through to masked id.
      }
      labels.set(userId, maskUserId(userId));
    })
  );

  return labels;
}

function matchRefundAmount(
  generation: {
    user_id: string;
    status: string;
    credits_used: number | null;
    created_at: string;
  },
  refunds: Array<{
    user_id: string;
    amount: number;
    type: string;
    created_at: string;
  }>
): number | null {
  if (generation.status !== "failed" || !generation.credits_used) return null;
  const createdMs = new Date(generation.created_at).getTime();
  const match = refunds.find((refund) => {
    if (refund.type !== "refund") return false;
    if (refund.user_id !== generation.user_id) return false;
    if (refund.amount !== generation.credits_used) return false;
    const refundMs = new Date(refund.created_at).getTime();
    return Math.abs(refundMs - createdMs) <= 20 * 60 * 1000;
  });
  return match?.amount ?? null;
}

export async function getAdminRecentGenerationJobs(
  limit = 50
): Promise<AdminGenerationJobRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, user_id, created_at, status, provider, model, workflow, credits_used, error_message, image_url, video_url"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];

  const userIds = data.map((row) => row.user_id as string);
  const userLabels = await resolveUserLabels(userIds);

  const since = data[data.length - 1]?.created_at;
  const { data: refunds } = await supabase
    .from("credit_transactions")
    .select("user_id, amount, type, created_at")
    .eq("type", "refund")
    .gte("created_at", since ?? new Date(0).toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  return data.map((row) => {
    const hasVideo = Boolean(row.video_url);
    const hasImage = Boolean(row.image_url);
    return {
      id: row.id as string,
      createdAt: row.created_at as string,
      userLabel: userLabels.get(row.user_id as string) ?? maskUserId(String(row.user_id)),
      actionId: inferActionId({
        workflow: (row.workflow as string | null) ?? null,
        provider: (row.provider as string | null) ?? null,
        model: (row.model as string | null) ?? null,
        hasVideo,
      }),
      engineId: inferEngineId((row.model as string | null) ?? null),
      outputType: inferOutputType({
        workflow: (row.workflow as string | null) ?? null,
        hasVideo,
        hasImage,
      }),
      status: (row.status as string) ?? "unknown",
      creditsCharged: (row.credits_used as number | null) ?? 0,
      creditsRefunded: matchRefundAmount(
        {
          user_id: row.user_id as string,
          status: (row.status as string) ?? "",
          credits_used: (row.credits_used as number | null) ?? null,
          created_at: row.created_at as string,
        },
        (refunds ?? []) as Array<{
          user_id: string;
          amount: number;
          type: string;
          created_at: string;
        }>
      ),
      hasAssetUrl: hasVideo || hasImage,
      errorMessage: shortenInternalError((row.error_message as string | null) ?? null),
    };
  });
}

export async function getAdminRecentCreditEvents(
  limit = 50
): Promise<AdminCreditEventRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id, user_id, amount, type, source, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];

  const userLabels = await resolveUserLabels(
    data.map((row) => row.user_id as string)
  );

  return data.map((row) => ({
    id: row.id as string,
    userLabel: userLabels.get(row.user_id as string) ?? maskUserId(String(row.user_id)),
    amount: (row.amount as number) ?? 0,
    type: (row.type as string) ?? "unknown",
    reason: ((row.source as string | null) ?? "—").slice(0, 120),
    relatedGenerationId: extractGenerationIdFromSource(
      (row.source as string | null) ?? null
    ),
    createdAt: row.created_at as string,
  }));
}
