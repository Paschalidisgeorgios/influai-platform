"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CREATIVE_SUITE_PRIMARY_NAV } from "./creative-suite-nav";

type CreativeSuiteSidebarProps = {
  language: "en" | "de";
  className?: string;
};

export default function CreativeSuiteSidebar({
  language,
  className = "",
}: CreativeSuiteSidebarProps) {
  const pathname = usePathname() ?? "/dashboard";
  const isDe = language === "de";

  return (
    <nav className={`flex flex-col gap-0.5 ${className}`}>
      {CREATIVE_SUITE_PRIMARY_NAV.filter((item) => item.primary).map((item) => {
        const onGallery =
          item.href === "/dashboard/gallery" &&
          (pathname.startsWith("/dashboard/gallery") ||
            pathname.startsWith("/dashboard/assets"));
        const active = onGallery
          ? true
          : item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const label = isDe ? item.labelDe : item.labelEn;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={label}
            className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
              active
                ? "border border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                : "border border-transparent text-neutral-400 hover:bg-neutral-900/55 hover:text-amber-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
