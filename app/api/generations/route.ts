import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const limitParam = Number(searchParams.get("limit") ?? "24");
    const offsetParam = Number(searchParams.get("offset") ?? "0");
    const favoriteParam = searchParams.get("favorite");
    const characterId = searchParams.get("characterId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const limit = Math.min(Math.max(limitParam, 1), 50);
    const offset = Math.max(offsetParam, 0);

    let query = supabaseAdmin
      .from("generations")
      .select(
        `
        id,
        prompt,
        final_prompt,
        image_url,
        status,
        error_message,
        provider,
        model,
        credits_used,
        is_favorite,
        character_id,
        created_at,
        ai_characters (
          id,
          name
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favoriteParam === "true") {
      query = query.eq("is_favorite", true);
    }

    if (characterId === "free") {
      query = query.is("character_id", null);
    } else if (characterId && characterId !== "all") {
      query = query.eq("character_id", characterId);
    }

    if (status === "completed" || status === "failed") {
      query = query.eq("status", status);
    }

    if (search && search.trim().length > 0) {
      query = query.ilike("prompt", `%${search.trim()}%`);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Generations fetch error:", error);

      return NextResponse.json(
        { error: "Failed to fetch generations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      generations: data ?? [],
      pagination: {
        limit,
        offset,
        count: data?.length ?? 0,
        hasMore: (data?.length ?? 0) === limit,
      },
    });
  } catch (error) {
    console.error("Generations route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}