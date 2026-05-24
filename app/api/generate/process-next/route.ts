import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const workerSecret = req.headers.get("x-worker-secret");

    if (workerSecret !== process.env.GENERATION_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedLimit = Number(body.limit ?? 3);
    const limit = Math.min(Math.max(requestedLimit, 1), 10);

    const { data: generations, error: fetchError } = await supabaseAdmin
      .from("generations")
      .select("id")
      .eq("status", "processing")
      .order("started_at", { ascending: true })
      .limit(limit);

    if (fetchError) {
      console.error("Fetch processing jobs error:", fetchError);

      return NextResponse.json(
        { error: "Failed to fetch processing jobs" },
        { status: 500 }
      );
    }

    if (!generations || generations.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        results: [],
      });
    }

    const origin =
      req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

    if (!origin) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    const results = [];

    for (const generation of generations) {
      const processResponse = await fetch(`${origin}/api/generate/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-worker-secret": process.env.GENERATION_WORKER_SECRET!,
        },
        body: JSON.stringify({
          generationId: generation.id,
        }),
      });

      const processData = await processResponse.json().catch(() => null);

      results.push({
        generationId: generation.id,
        ok: processResponse.ok,
        status: processResponse.status,
        result: processData,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Process next generations error:", error);

    return NextResponse.json(
      { error: "Process next generations failed" },
      { status: 500 }
    );
  }
}