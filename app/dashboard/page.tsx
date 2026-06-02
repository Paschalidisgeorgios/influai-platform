import ObsidianLayout from "./components/obsidian/ObsidianLayout";
import ProgressiveDisclosureDashboard from "./components/ProgressiveDisclosureDashboard";

/**
 * Calm tool home — generator UI opens in GeneratorOverlay (progressive disclosure).
 */
export default function DashboardPage() {
  return (
    <ObsidianLayout>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <ProgressiveDisclosureDashboard />
      </div>
    </ObsidianLayout>
  );
}
