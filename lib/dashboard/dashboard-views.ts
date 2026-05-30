/** Active dashboard views (reset-state). */
export type DashboardView = "home" | "image" | "assets" | "billing";

export const DASHBOARD_VIEW_PATHS: Record<DashboardView, string> = {
  home: "/dashboard",
  image: "/dashboard/image",
  assets: "/dashboard/assets",
  billing: "/dashboard/credits",
};
