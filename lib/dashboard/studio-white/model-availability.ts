import type { ModelAvailability } from "@/lib/ai/krea-model-registry";

export type ModelAvailabilityState = {
  isHidden: boolean;
  isUnavailable: boolean;
  isExperimental: boolean;
  isActive: boolean;
  isSelectable: boolean;
};

/** Maps registry/studio availability to picker UI state. */
export function modelAvailabilityState(
  availability?: ModelAvailability
): ModelAvailabilityState {
  const isHidden = availability === "hidden";
  const isUnavailable = availability === "not_configured";
  const isExperimental = availability === "experimental";
  const isActive = availability === "active" || availability === undefined;
  const isSelectable = isActive || isExperimental;

  return {
    isHidden,
    isUnavailable,
    isExperimental,
    isActive,
    isSelectable,
  };
}

export function isModelPickerSelectable(availability?: ModelAvailability): boolean {
  return modelAvailabilityState(availability).isSelectable;
}
