import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return {
      user: null,
      error: "Missing authorization header",
    };
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: "Unauthorized",
    };
  }

  return {
    user,
    error: null,
  };
}

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const limit = Math.min(Number(searchParams.get("limit") ?? 24), 60);
    const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);
    const favorite = searchParams.get("favorite");
    const status = searchParams.get("status");
    const characterId = searchParams.get("characterId");
    const search = searchParams.get("search");

    let query = supabaseAdmin
      .from("generations")
      .select(
        `
        id,
        user_id,
        prompt,
        final_prompt,
        image_url,
        video_url,
        duration_seconds,
        created_at,
        provider,
        model,
        status,
        error_message,
        is_favorite,
        character_id,
        workflow,
        social_platform,
        output_format,
        image_size,
        output_width,
        output_height
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (favorite === "true") {
      query = query.eq("is_favorite", true);
    }

    if (
      status === "processing" ||
      status === "completed" ||
      status === "failed"
    ) {
      query = query.eq("status", status);
    }

    if (characterId && characterId !== "all" && characterId !== "free") {
      query = query.eq("character_id", characterId);
    }

    if (characterId === "free") {
      query = query.is("character_id", null);
    }

    if (search && search.trim()) {
      query = query.ilike("prompt", `%${search.trim()}%`);
    }

    let { data: generations, error, count } = await query;

    if (
      error &&
      /video_url|duration_seconds|Could not find the .* column/i.test(
        error.message ?? ""
      )
    ) {
      let fallbackQuery = supabaseAdmin
        .from("generations")
        .select(
          `
        id,
        user_id,
        prompt,
        final_prompt,
        image_url,
        created_at,
        provider,
        model,
        status,
        error_message,
        is_favorite,
        character_id,
        workflow,
        social_platform,
        output_format,
        image_size,
        output_width,
        output_height
      `,
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (favorite === "true") {
        fallbackQuery = fallbackQuery.eq("is_favorite", true);
      }

      if (
        status === "processing" ||
        status === "completed" ||
        status === "failed"
      ) {
        fallbackQuery = fallbackQuery.eq("status", status);
      }

      if (characterId && characterId !== "all" && characterId !== "free") {
        fallbackQuery = fallbackQuery.eq("character_id", characterId);
      }

      if (characterId === "free") {
        fallbackQuery = fallbackQuery.is("character_id", null);
      }

      if (search && search.trim()) {
        fallbackQuery = fallbackQuery.ilike("prompt", `%${search.trim()}%`);
      }

      const fallbackResult = await fallbackQuery;
      generations = (fallbackResult.data ?? []).map((row) => ({
        ...row,
        video_url: null,
        duration_seconds: null,
      }));
      error = fallbackResult.error;
      count = fallbackResult.count;
    }

    if (error) {
      console.error("Generations fetch error:", error);

      return NextResponse.json(
        { error: "Failed to fetch generations" },
        { status: 500 }
      );
    }

    const characterIds = Array.from(
      new Set(
        (generations ?? [])
          .map((generation) => generation.character_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    let characterMap = new Map<string, { id: string; name: string }>();

    if (characterIds.length > 0) {
      const { data: characters, error: charactersError } = await supabaseAdmin
        .from("ai_characters")
        .select("id, name")
        .in("id", characterIds)
        .eq("user_id", user.id);

      if (charactersError) {
        console.error("Generation character fetch error:", charactersError);
      } else {
        characterMap = new Map(
          (characters ?? []).map((character) => [
            character.id,
            {
              id: character.id,
              name: character.name,
            },
          ])
        );
      }
    }

    const formattedGenerations = (generations ?? []).map((generation) => ({
      ...generation,
      ai_characters: generation.character_id
        ? characterMap.get(generation.character_id) ?? null
        : null,
    }));

    return NextResponse.json({
      success: true,
      generations: formattedGenerations,
      pagination: {
        limit,
        offset,
        count: count ?? 0,
        hasMore: offset + limit < (count ?? 0),
      },
    });
  } catch (error) {
    console.error("Generations GET route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}