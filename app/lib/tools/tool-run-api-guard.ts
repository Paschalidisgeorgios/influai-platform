/**
 * API route helper — block uploads/generation when a creator tool is not runnable.
 */

import { NextResponse } from "next/server";
import type { CreatorToolId } from "./creator-tools";
import {
  CREATOR_REFERENCE_UPLOAD_TOOL_IDS,
  CREATOR_TRAINING_TOOL_IDS,
} from "./creator-tools";
import {
  assertToolCanRun,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "./assert-tool-can-run";

export function blockUnlessToolCanRun(input: {
  toolId: CreatorToolId;
  language?: "en" | "de";
}): NextResponse | null {
  try {
    assertToolCanRun({
      toolId: input.toolId,
      language: input.language ?? "en",
    });
    return null;
  } catch (error) {
    if (isToolRunBlockedError(error)) {
      return NextResponse.json(
        { success: false, error: error.userMessage },
        { status: error.status }
      );
    }
    if (isToolRunInsufficientCreditsError(error)) {
      return NextResponse.json(
        { success: false, error: error.userMessage, code: "INSUFFICIENT_CREDITS" },
        { status: error.status }
      );
    }
    throw error;
  }
}

/** Block when none of the listed tools may run (e.g. shared upload routes). */
export function blockUnlessAnyToolCanRun(input: {
  toolIds: readonly CreatorToolId[];
  language?: "en" | "de";
}): NextResponse | null {
  for (const toolId of input.toolIds) {
    try {
      assertToolCanRun({
        toolId,
        language: input.language ?? "en",
      });
      return null;
    } catch (error) {
      if (
        !isToolRunBlockedError(error) &&
        !isToolRunInsufficientCreditsError(error)
      ) {
        throw error;
      }
    }
  }

  const language = input.language ?? "en";
  const message =
    language === "de"
      ? "Dieser Workflow ist für Rendering noch nicht verfügbar."
      : "This workflow is not available for rendering yet.";

  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}

/** Reference uploads only when at least one reference workflow is live. */
export function blockUnlessReferenceUploadAllowed(input?: {
  language?: "en" | "de";
}): NextResponse | null {
  return blockUnlessAnyToolCanRun({
    toolIds: CREATOR_REFERENCE_UPLOAD_TOOL_IDS,
    language: input?.language,
  });
}

/** Training uploads / jobs only when a training workflow is live. */
export function blockUnlessTrainingUploadAllowed(input?: {
  language?: "en" | "de";
}): NextResponse | null {
  return blockUnlessAnyToolCanRun({
    toolIds: CREATOR_TRAINING_TOOL_IDS,
    language: input?.language,
  });
}
