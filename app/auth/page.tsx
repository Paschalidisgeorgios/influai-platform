import { Suspense } from "react";
import AuthWorkspace from "./AuthWorkspace";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthWorkspace />
    </Suspense>
  );
}
