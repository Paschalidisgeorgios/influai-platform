/** Provider-neutral engine generate — Krea + fal.ai */
import { handleEngineGenerate } from "@/lib/ai/engine-generate-handler";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  return handleEngineGenerate(req);
}
