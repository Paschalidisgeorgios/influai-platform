import { handleMotionTransferGenerate } from "@/lib/krea/motion-transfer-generate-handler";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  return handleMotionTransferGenerate(req);
}
