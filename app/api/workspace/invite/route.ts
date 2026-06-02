import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import type { Workspace, WorkspaceRole } from "@/lib/workspace/workspace";

export const runtime = "nodejs";

type InviteRequestBody = {
  workspaceId?: string;
  email?: string;
  role?: WorkspaceRole;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  const { supabase, user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return NextResponse.json(
      { error: authError ?? "Unauthorized" },
      { status: 401 }
    );
  }

  let body: InviteRequestBody;
  try {
    body = (await req.json()) as InviteRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workspaceId =
    typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
  const email =
    typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const inviteRole: WorkspaceRole =
    body.role === "admin" || body.role === "member" ? body.role : "member";

  if (!workspaceId || !email) {
    return NextResponse.json(
      { error: "workspaceId and email are required" },
      { status: 400 }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { data: workspaceRow, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name, owner_id, plan, shared_credits, max_seats")
    .eq("id", workspaceId)
    .maybeSingle();

  if (workspaceError || !workspaceRow) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const workspace = workspaceRow as Workspace;

  if (workspace.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Only the workspace owner can invite members" },
      { status: 403 }
    );
  }

  const { count: memberCount, error: countError } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["invited", "active"]);

  if (countError) {
    console.error("workspace_members count error:", countError);
    return NextResponse.json({ error: "Failed to check seats" }, { status: 500 });
  }

  const seatsUsed = memberCount ?? 0;
  if (seatsUsed >= workspace.max_seats) {
    return NextResponse.json(
      { error: "Workspace seat limit reached" },
      { status: 400 }
    );
  }

  const inviteToken = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("workspace_members").upsert(
    {
      workspace_id: workspaceId,
      user_id: null,
      email,
      role: inviteRole,
      status: "invited",
      invite_token: inviteToken,
      invited_at: now,
      accepted_at: null,
      updated_at: now,
    },
    { onConflict: "workspace_id,email" }
  );

  if (insertError) {
    console.error("workspace_members invite error:", insertError);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const inviteUrl = `${origin.replace(/\/$/, "")}/dashboard/workspace/accept?token=${encodeURIComponent(inviteToken)}`;

  return NextResponse.json({
    success: true,
    inviteUrl,
    email,
    workspaceId,
    status: "invited",
  });
}
