/**
 * Client-safe launch engine filtering — hides inactive/mapped engines from pickers.
 */

import {
  getActiveEngines,
  getEngineCreditsForId,
  normalizeToLaunchEngineId,
} from "@/app/lib/engines/catalog";
import type { ModelOption } from "@/lib/dashboard/workspace-types";

const ACTIVE_LAUNCH = getActiveEngines();

const ACTIVE_PICKER_VALUES = new Set<string>();

for (const engine of ACTIVE_LAUNCH) {
  ACTIVE_PICKER_VALUES.add(engine.id);
  if (engine.kreaStudioId) ACTIVE_PICKER_VALUES.add(engine.kreaStudioId);
  if (engine.kreaRegistryId) ACTIVE_PICKER_VALUES.add(engine.kreaRegistryId);
  if (engine.falRegistryId) ACTIVE_PICKER_VALUES.add(engine.falRegistryId);
}

export function isLaunchActivePickerValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (ACTIVE_PICKER_VALUES.has(trimmed)) return true;
  const launchId = normalizeToLaunchEngineId(trimmed);
  return ACTIVE_LAUNCH.some((engine) => engine.id === launchId);
}

export function filterModelOptionsToLaunchActive(options: ModelOption[]): ModelOption[] {
  return options.filter((option) => isLaunchActivePickerValue(option.value));
}

export function getLaunchCreditsForPickerValue(value: string): number | undefined {
  const launchId = normalizeToLaunchEngineId(value);
  const credits = getEngineCreditsForId(launchId);
  return credits > 0 ? credits : undefined;
}

export function getDefaultLaunchVideoEngineId(): string {
  return "fal_kling_v3_t2v";
}

export function getDefaultLaunchImageStudioId(): string {
  return "smart_auto_pilot";
}
