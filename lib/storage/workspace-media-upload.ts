import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type WorkspaceMediaKind = "video" | "audio" | "image";

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
]);

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function resolveExt(file: File, kind: WorkspaceMediaKind): string | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (kind === "video") {
    if (mime.includes("webm") || name.endsWith(".webm")) return "webm";
    if (mime.includes("quicktime") || name.endsWith(".mov")) return "mov";
    if (mime.includes("mp4") || name.endsWith(".mp4")) return "mp4";
    return name.endsWith(".mp4") ? "mp4" : null;
  }

  if (kind === "audio") {
    if (mime.includes("webm") || name.endsWith(".webm")) return "webm";
    if (mime.includes("wav") || name.endsWith(".wav")) return "wav";
    if (mime.includes("mpeg") || mime.includes("mp3") || name.endsWith(".mp3"))
      return "mp3";
    return null;
  }

  if (mime.includes("png") || name.endsWith(".png")) return "png";
  if (mime.includes("webp") || name.endsWith(".webp")) return "webp";
  if (mime.includes("jpeg") || mime.includes("jpg") || name.endsWith(".jpg"))
    return "jpg";
  return null;
}

function isAllowedMime(file: File, kind: WorkspaceMediaKind): boolean {
  const mime = file.type.toLowerCase();
  if (!mime) return true;
  if (kind === "video") return VIDEO_MIMES.has(mime);
  if (kind === "audio") return AUDIO_MIMES.has(mime);
  return IMAGE_MIMES.has(mime);
}

export async function uploadWorkspaceMedia(params: {
  bucket: string;
  userId: string;
  file: File;
  kind: WorkspaceMediaKind;
  maxBytes?: number;
}) {
  const { bucket, userId, file, kind, maxBytes = 80 * 1024 * 1024 } = params;

  const ext = resolveExt(file, kind);
  if (!ext || !isAllowedMime(file, kind)) {
    throw new Error(`Unsupported ${kind} file type.`);
  }

  if (file.size > maxBytes) {
    throw new Error("File exceeds maximum upload size.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    console.error(`Workspace upload error (${bucket}):`, uploadError);
    throw new Error("Storage upload failed.");
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

export async function authenticateBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
