import { redirect } from "next/navigation";
import {
  isLaunchModuleEnabled,
  LAUNCH_CONFIG,
  type LaunchModuleKey,
} from "./launch";

/** Redirect to Create when a module is disabled under launch lock. */
export function guardLaunchModule(module: LaunchModuleKey): void {
  if (LAUNCH_CONFIG.launchMode && !isLaunchModuleEnabled(module)) {
    redirect("/dashboard");
  }
}
