/**
 * Server-side Krea SDK client — KREA_API_KEY only, never exposed to the client.
 * @see https://docs.krea.ai/developers/introduction
 */

import { Krea, type KreaClient } from "@krea-ai/sdk";
import { getKreaApiKey } from "@/lib/providers/krea";

let cachedClient: KreaClient | null = null;

/** Singleton Krea SDK client (server-only). */
export function getKreaSdkClient(): KreaClient {
  if (!cachedClient) {
    cachedClient = new Krea({ apiKey: getKreaApiKey() });
  }
  return cachedClient;
}

export type KreaSubscribeOptions = {
  subscribePath: string;
  input: Record<string, unknown>;
  onQueueUpdate?: (job: { status?: string }) => void;
};

export type KreaSubscribeResult = {
  requestId?: string;
  providerJobId?: string;
  data: unknown;
  raw: unknown;
};

/** Submit + poll via official SDK subscribe(). */
export async function kreaSubscribe(
  options: KreaSubscribeOptions
): Promise<KreaSubscribeResult> {
  const client = getKreaSdkClient();
  const result = await client.subscribe(options.subscribePath, {
    input: options.input,
    onQueueUpdate: options.onQueueUpdate,
  });

  const raw = result as Record<string, unknown>;
  const requestId =
    typeof raw.requestId === "string" ? raw.requestId : undefined;
  const data = raw.data ?? raw.result ?? raw;
  const providerJobId =
    typeof raw.requestId === "string"
      ? raw.requestId
      : typeof (data as Record<string, unknown>)?.job_id === "string"
        ? ((data as Record<string, unknown>).job_id as string)
        : undefined;

  return {
    requestId,
    providerJobId,
    data,
    raw: result,
  };
}
