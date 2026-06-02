export type WorkspaceRole = "owner" | "admin" | "member";

export type WorkspacePlan = "team_starter" | "team_pro";

export type Workspace = {
  id: string;
  name: string;
  owner_id: string;
  plan: WorkspacePlan;
  shared_credits: number;
  max_seats: number;
};

export type WorkspaceMemberStatus = "invited" | "active" | "removed";

export type WorkspaceMember = {
  workspace_id: string;
  user_id: string | null;
  email: string;
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
  invite_token?: string | null;
  invited_at: string;
  accepted_at?: string | null;
};

export type WorkspaceInviteRow = WorkspaceMember & {
  id: string;
};
