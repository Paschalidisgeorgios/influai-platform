import { handleSocialAssetPackRenderRequest } from "@/app/lib/packs/handle-social-asset-pack-render";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleSocialAssetPackRenderRequest(req);
}
