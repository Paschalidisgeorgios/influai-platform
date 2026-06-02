"use client";

type Props = {
  label: string;
  className?: string;
};

/** Subtle section label for dashboard zones */
export default function DashboardZoneLabel({ label, className = "" }: Props) {
  return (
    <p
      className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 ${className}`}
    >
      {label}
    </p>
  );
}
