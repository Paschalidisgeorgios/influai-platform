"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  obsidianButtonClass,
  type ObsidianButtonSize,
  type ObsidianButtonSurface,
  type ObsidianButtonVariant,
} from "@/lib/obsidian/button-tokens";

type StyleProps = {
  variant?: ObsidianButtonVariant;
  size?: ObsidianButtonSize;
  surface?: ObsidianButtonSurface;
  fullWidth?: boolean;
  className?: string;
};

type CommonProps = StyleProps & {
  children: ReactNode;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

export type ObsidianButtonProps = ButtonProps | LinkProps;

function resolveClasses({
  variant = "primary",
  size = "md",
  surface = "dashboard",
  fullWidth,
  className,
}: StyleProps) {
  return obsidianButtonClass(variant, { size, surface, fullWidth, className });
}

/**
 * Premium Obsidian CTA — use variant sparingly; only `primary` gets Lava-Amber glow.
 */
export default function ObsidianButton(props: ObsidianButtonProps) {
  const {
    variant = "primary",
    size = "md",
    surface = "dashboard",
    fullWidth,
    className,
    children,
    ...rest
  } = props;

  const classes = resolveClasses({
    variant,
    size,
    surface,
    fullWidth,
    className,
  });

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
