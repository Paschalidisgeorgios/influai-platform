import StudioShell from "@/components/creator-studio/StudioShell";
import StudioWorkspace from "@/components/creator-studio/StudioWorkspace";

export const metadata = {
  title: "Creator Studio | InfluExAI",
  description: "Action-first AI Creator Studio for social content",
};

export default function StudioPage() {
  return (
    <StudioShell>
      <StudioWorkspace />
    </StudioShell>
  );
}
