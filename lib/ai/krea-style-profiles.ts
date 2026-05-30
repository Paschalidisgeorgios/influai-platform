/**
 * Custom style profiles produced by Krea LoRA / style training workflows.
 * Persisted later via Supabase — types only for now (no destructive DB changes).
 */

export type CustomStyleTrainingType =
  | "style"
  | "character"
  | "object"
  | "product"
  | "brand";

export type CustomStyleProfileStatus =
  | "queued"
  | "training"
  | "completed"
  | "failed";

/** Maps registry training workflow ids to UI training type. */
export const TRAINING_REGISTRY_TO_TYPE: Record<string, CustomStyleTrainingType> = {
  style_lora_training: "style",
  character_lora_training: "character",
  object_product_lora_training: "product",
  brand_style_training: "brand",
};

export type CustomStyleProfile = {
  id: string;
  name: string;
  trainingType: CustomStyleTrainingType;
  provider: "krea";
  /** Krea-side style / LoRA id after training completes */
  providerStyleId: string;
  status: CustomStyleProfileStatus;
  registryModelId?: string;
  triggerWord?: string;
  previewImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainLoRARequest = {
  trainingType: CustomStyleTrainingType;
  registryModelId: string;
  name: string;
  imageUrls: string[];
  triggerWord?: string;
  description?: string;
};

export type TrainLoRAResponse = {
  success: true;
  styleId: string;
  status: "queued" | "training" | "completed";
};

/** Training route is wired when this env flag is explicitly true (server-only). */
export function isKreaTrainLoRARouteEnabled(): boolean {
  return process.env.ENABLE_KREA_TRAIN_LORA === "true";
}
