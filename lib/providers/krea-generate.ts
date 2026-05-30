/**
 * Krea-only generation surface for InfluExAi dashboard.
 * Re-exports the working Krea client; legacy providers must not be imported here.
 */

export {
  createKreaImageJob,
  createKreaEditJob,
  createKreaEnhanceJob,
  createKreaVideoJob,
  generateKreaImage,
  generateKreaEdit,
  generateKreaEnhance,
  generateKreaVideo,
  pollKreaJob,
  waitForKreaJob,
  getKreaApiKey,
  kreaRequest,
  kreaDimensionsFromAspectRatio,
  kreaAspectRatioFromFormatKey,
  resolveKreaModelId,
  type KreaCreateImageJobInput,
  type KreaCreateEditJobInput,
  type KreaCreateEnhanceJobInput,
  type KreaCreateVideoJobInput,
  type KreaGenerationResult,
} from "./krea";

import { generateKreaEdit, generateKreaVideo } from "./krea";

/** Video restyle uses reference-edit pipeline on Krea today. */
export async function generateKreaVideoRestyle(
  input: Parameters<typeof generateKreaEdit>[0]
) {
  return generateKreaEdit({
    ...input,
    workflow: input.workflow ?? "reference_edit",
  });
}

/** 3D object renders use premium image pipeline. */
export async function generateKrea3DObject(
  input: Parameters<typeof import("./krea").generateKreaImage>[0]
) {
  const { generateKreaImage } = await import("./krea");
  return generateKreaImage({
    ...input,
    workflow: input.workflow ?? "premium_image",
  });
}

export async function generateKreaMotion(): Promise<never> {
  throw new Error(
    "Motion transfer is not available in the Krea-only platform yet."
  );
}

export async function generateKreaLipsync(): Promise<never> {
  throw new Error("Lip sync is not available in the Krea-only platform yet.");
}
