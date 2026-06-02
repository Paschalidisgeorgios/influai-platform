import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Image,
  Palette,
  Settings,
  Sparkles,
} from "lucide-react";

export type CreativeSuiteNavItem = {
  href: string;
  labelEn: string;
  labelDe: string;
  exact?: boolean;
  icon: LucideIcon;
  /** Primary dashboard navigation */
  primary?: boolean;
};

export const CREATIVE_SUITE_PRIMARY_NAV: readonly CreativeSuiteNavItem[] = [
  {
    href: "/dashboard",
    labelEn: "Create",
    labelDe: "Erstellen",
    exact: true,
    icon: Sparkles,
    primary: true,
  },
  {
    href: "/dashboard/gallery",
    labelEn: "Gallery",
    labelDe: "Galerie",
    icon: Image,
    primary: true,
  },
  {
    href: "/dashboard/brand-kit",
    labelEn: "Brand Kit",
    labelDe: "Brand Kit",
    icon: Palette,
    primary: true,
  },
  {
    href: "/dashboard/credits",
    labelEn: "Credits",
    labelDe: "Credits",
    icon: CreditCard,
    primary: true,
  },
  {
    href: "/dashboard/settings",
    labelEn: "Settings",
    labelDe: "Einstellungen",
    icon: Settings,
    primary: true,
  },
] as const;
