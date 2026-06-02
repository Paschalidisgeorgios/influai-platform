/**
 * Official Krea API model catalog — sourced from @krea-ai/sdk OpenAPI snapshot.
 * Regenerate: node scripts/generate-krea-official-catalog.mjs
 */

import {
  KREA_OFFICIAL_ENDPOINT_RECORDS,
  KREA_OFFICIAL_MODEL_PATHS,
  type KreaOfficialEndpointKind,
  type KreaOfficialEndpointRecord,
} from "./krea-official-endpoints.generated";

export type { KreaOfficialEndpointKind };

export type KreaOfficialEndpoint = KreaOfficialEndpointRecord & {
  optionalFields: readonly string[];
};

export type KreaOfficialTrainingEndpoint = {
  apiPath: string;
  subscribePath: "styles/train";
  requiredFields: readonly string[];
};

/** All official generation endpoints from the Krea OpenAPI spec. */
export const KREA_OFFICIAL_ENDPOINTS: readonly KreaOfficialEndpoint[] =
  KREA_OFFICIAL_ENDPOINT_RECORDS.map((entry) => ({
    ...entry,
    optionalFields: [],
  }));

const BY_MODEL_PATH = new Map<string, KreaOfficialEndpoint>(
  KREA_OFFICIAL_ENDPOINTS.map((entry) => [entry.modelPath, entry])
);

const BY_SUBSCRIBE_PATH = new Map<string, KreaOfficialEndpoint>(
  KREA_OFFICIAL_ENDPOINTS.map((entry) => [entry.subscribePath, entry])
);

export function getOfficialKreaEndpoint(
  modelPath: string
): KreaOfficialEndpoint | undefined {
  const normalized = modelPath.replace(/^\/+/, "");
  return BY_MODEL_PATH.get(normalized);
}

export function getOfficialKreaEndpointBySubscribePath(
  subscribePath: string
): KreaOfficialEndpoint | undefined {
  const normalized = subscribePath.replace(/^\/+/, "");
  return BY_SUBSCRIBE_PATH.get(normalized);
}

export function isOfficialKreaModelPath(modelPath: string): boolean {
  return KREA_OFFICIAL_MODEL_PATHS.has(modelPath.replace(/^\/+/, ""));
}

export function assertOfficialKreaModelPath(modelPath: string): KreaOfficialEndpoint {
  const entry = getOfficialKreaEndpoint(modelPath);
  if (!entry) {
    throw new Error(`OFFICIAL_MODEL_NOT_FOUND:${modelPath}`);
  }
  return entry;
}

export function getOfficialEndpointsByKind(
  kind: KreaOfficialEndpointKind
): readonly KreaOfficialEndpoint[] {
  return KREA_OFFICIAL_ENDPOINTS.filter((entry) => entry.kind === kind);
}

export function countOfficialCatalogStats(): {
  total: number;
  image: number;
  video: number;
  enhance: number;
} {
  return {
    total: KREA_OFFICIAL_ENDPOINTS.length,
    image: getOfficialEndpointsByKind("image").length,
    video: getOfficialEndpointsByKind("video").length,
    enhance: getOfficialEndpointsByKind("enhance").length,
  };
}

/** Compare registry internalModel against the official catalog. */
export function auditRegistryModelPath(modelPath: string): {
  ok: boolean;
  official?: KreaOfficialEndpoint;
  reason?: "pending" | "resolver" | "not_in_openapi" | "empty";
} {
  const path = modelPath.trim();
  if (!path) return { ok: false, reason: "empty" };
  if (path.startsWith("pending/")) return { ok: false, reason: "pending" };
  if (path.startsWith("resolver/")) return { ok: false, reason: "resolver" };

  const official = getOfficialKreaEndpoint(path);
  if (!official) return { ok: false, reason: "not_in_openapi" };
  return { ok: true, official };
}

export { KREA_OFFICIAL_MODEL_PATHS };
