"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Dashboard from "../components/creative-suite/Dashboard";

function ImageToolContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? undefined;

  return <Dashboard tool="image" initialPrompt={prompt} />;
}

export default function ImageToolPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm font-medium text-white/50">
          Loading studio…
        </div>
      }
    >
      <ImageToolContent />
    </Suspense>
  );
}
