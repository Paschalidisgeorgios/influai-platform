"use client";

import type { ReactNode } from "react";
import { OBS } from "@/lib/obsidian/dashboard-tokens";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function SettingsSection({
  title,
  description,
  children,
  className = "",
}: Props) {
  return (
    <section className={`${OBS.glassPad} space-y-4 border-white/10 ${className}`}>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
