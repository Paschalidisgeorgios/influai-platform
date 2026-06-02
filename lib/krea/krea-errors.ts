/** Krea generation error codes — server-side. */

export class KreaGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "KreaGenerationError";
  }
}

export function isKreaToolNotImplemented(error: unknown): boolean {
  if (error instanceof KreaGenerationError) {
    return error.code === "KREA_TOOL_NOT_IMPLEMENTED";
  }
  if (error instanceof Error) {
    return error.message.includes("KREA_TOOL_NOT_IMPLEMENTED");
  }
  return false;
}

export function throwNotImplemented(message?: string): never {
  throw new KreaGenerationError(
    message ?? "This engine is being connected.",
    "KREA_TOOL_NOT_IMPLEMENTED",
    503
  );
}
