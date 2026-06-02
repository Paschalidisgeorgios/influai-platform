/**
 * fal.ai — server-side registry & client re-exports
 */

export { getFalClient, isFalKeyConfigured } from "./fal-client";
export {
  getAllFalModels,
  getEnabledFalModels,
  getFalModelById,
  getFalModelsByCategory,
  DEFAULT_IMAGE_MODEL_ID,
  DEFAULT_VIDEO_MODEL_ID,
  HD_EXPORT_MODEL_ID,
  HD_EXPORT_CREDIT_COST,
  FAL_MODELS,
  type FalModelDefinition,
  type FalModelCategory,
} from "@/config/models";
