import { getSupabaseAdmin } from "@/app/lib/supabase-admin";

const STORAGE_BUCKET = "generations";

export async function refundUserCredits({
  userId,
  creditsToRefund,
  source,
}: {
  userId: string;
  creditsToRefund: number;
  source: string;
}) {
  if (creditsToRefund <= 0) return;

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: creditsToRefund,
  });

  if (error) {
    console.error("POC credit refund error:", error);
  }

  const { error: transactionError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: creditsToRefund,
    type: "refund",
    source,
  });

  if (transactionError) {
    console.error("POC refund transaction log error:", transactionError);
  }
}

export async function uploadImageFromRemoteUrl({
  userId,
  remoteUrl,
}: {
  userId: string;
  remoteUrl: string;
}): Promise<string> {
  const response = await fetch(remoteUrl);

  if (!response.ok) {
    throw new Error(`Failed to download provider image (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = contentType.includes("jpeg")
    ? "jpg"
    : contentType.includes("webp")
      ? "webp"
      : "png";

  const supabase = getSupabaseAdmin();
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export async function markGenerationCompleted({
  generationId,
  imageUrl,
  videoUrl,
  providerJobId,
}: {
  generationId: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  providerJobId?: string | null;
}) {
  const supabase = getSupabaseAdmin();

  const payload: Record<string, unknown> = {
    status: "completed",
    error_message: null,
    completed_at: new Date().toISOString(),
  };

  if (imageUrl) payload.image_url = imageUrl;
  if (videoUrl) payload.video_url = videoUrl;
  if (providerJobId) payload.provider_job_id = providerJobId;

  const { error } = await supabase
    .from("generations")
    .update(payload)
    .eq("id", generationId)
    .eq("status", "processing");

  if (error) {
    throw new Error(error.message);
  }
}

const VIDEO_STORAGE_BUCKET = "generation-videos";

export async function uploadVideoFromRemoteUrl({
  userId,
  remoteUrl,
}: {
  userId: string;
  remoteUrl: string;
}): Promise<string> {
  const response = await fetch(remoteUrl);

  if (!response.ok) {
    throw new Error(`Failed to download provider video (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "video/mp4";
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = contentType.includes("webm")
    ? "webm"
    : contentType.includes("quicktime")
      ? "mov"
      : "mp4";

  const supabase = getSupabaseAdmin();
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(VIDEO_STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(VIDEO_STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export async function markGenerationFailed({
  generationId,
  errorMessage,
}: {
  generationId: string;
  errorMessage: string;
}) {
  const supabase = getSupabaseAdmin();

  await supabase
    .from("generations")
    .update({
      status: "failed",
      error_message: errorMessage.slice(0, 500),
      credits_used: 0,
      failed_at: new Date().toISOString(),
    })
    .eq("id", generationId);
}
