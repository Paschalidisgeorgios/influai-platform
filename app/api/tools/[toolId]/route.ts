/**
 * Unified creator tool API — POST /api/tools/[toolId]
 * Routes to registered server handlers without exposing provider/model ids.
 */

import { runCreatorToolHandler } from "@/app/lib/tools/run-tool-handler";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = {
  params: Promise<{ toolId: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { toolId } = await context.params;
  return runCreatorToolHandler(toolId, req);
}
