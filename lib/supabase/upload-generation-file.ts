import type { SupabaseClient } from "@supabase/supabase-js";

export type GenerationUploadBucket =
  | "reference-sources"
  | "generation-videos"
  | "generation-audio";

export async function uploadGenerationFile({
  supabase,
  userId,
  file,
  bucket,
  folder,
}: {
  supabase: SupabaseClient;
  userId: string;
  file: File;
  bucket: GenerationUploadBucket;
  folder: string;
}) {
  if (!userId) {
    throw new Error("Missing user id");
  }

  if (!file) {
    throw new Error("Missing file");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${userId}/${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (error) {
    console.error("[storage-upload]", {
      bucket,
      path,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      message: error.message,
    });

    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    url: publicUrlData.publicUrl,
  };
}
