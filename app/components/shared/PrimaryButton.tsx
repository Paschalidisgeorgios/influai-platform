"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function PrimaryButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#d8ad5f] text-black hover:bg-[#efc777] active:scale-[0.98]",
    secondary:
      "border border-white/15 text-white hover:bg-white/5 active:scale-[0.98]",
    ghost: "text-white/60 hover:text-white active:scale-[0.98]",
  };
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type="button"
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
