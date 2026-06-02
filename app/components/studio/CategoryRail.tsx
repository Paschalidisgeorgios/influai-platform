"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import {
  AudioLines,
  Clapperboard,
  GraduationCap,
  Sparkles,
  Star,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";
import {
  getStudioCategory,
  STUDIO_CATEGORY_COPY,
  STUDIO_CATEGORY_ORDER,
} from "@/app/lib/studio/studio-categories";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import {
  CATEGORY_RAIL_HEADER,
  CATEGORY_RAIL_HEADER_MOBILE,
  CATEGORY_RAIL_ICON,
  CATEGORY_RAIL_ICON_ACTIVE,
  CATEGORY_RAIL_ITEM_ACTIVE,
  CATEGORY_RAIL_ITEM_BASE,
  CATEGORY_RAIL_ITEM_INACTIVE,
  CATEGORY_RAIL_LAVA_BAR,
  CATEGORY_RAIL_LABEL,
  CATEGORY_RAIL_LIST,
  CATEGORY_RAIL_META,
  CATEGORY_RAIL_META_ACTIVE,
  CATEGORY_RAIL_SHELL,
} from "@/lib/studio/category-rail-tokens";

const CATEGORY_ICONS: Record<CreatorToolboxGroupId, LucideIcon> = {
  create: Sparkles,
  edit: Wand2,
  animate: Clapperboard,
  train: GraduationCap,
  optimize: Star,
  advanced: AudioLines,
};

type Props = {
  selectedId: CreatorToolboxGroupId;
  onSelect: (id: CreatorToolboxGroupId) => void;
  language?: "en" | "de";
  className?: string;
};

type CategoryRailItemProps = {
  id: CreatorToolboxGroupId;
  active: boolean;
  label: string;
  toolCount: number;
  description: string;
  isDe: boolean;
  tabIndex: number;
  onSelect: (id: CreatorToolboxGroupId) => void;
  onKeyNavigate: (event: KeyboardEvent<HTMLButtonElement>, id: CreatorToolboxGroupId) => void;
  buttonRef: (el: HTMLButtonElement | null, id: CreatorToolboxGroupId) => void;
};

function CategoryRailItem({
  id,
  active,
  label,
  toolCount,
  description,
  isDe,
  tabIndex,
  onSelect,
  onKeyNavigate,
  buttonRef,
}: CategoryRailItemProps) {
  const Icon = CATEGORY_ICONS[id];
  const toolsLabel =
    toolCount === 1
      ? isDe
        ? "1 Tool"
        : "1 tool"
      : isDe
        ? `${toolCount} Tools`
        : `${toolCount} tools`;

  return (
    <li className="shrink-0 snap-start md:snap-align-none md:shrink md:w-full">
      <button
        ref={(el) => buttonRef(el, id)}
        type="button"
        role="tab"
        id={`category-rail-tab-${id}`}
        aria-selected={active}
        aria-current={active ? "true" : undefined}
        aria-controls="studio-workspace-panel"
        tabIndex={tabIndex}
        title={`${description} · ${toolsLabel}`}
        onClick={() => onSelect(id)}
        onKeyDown={(event) => onKeyNavigate(event, id)}
        className={`${CATEGORY_RAIL_ITEM_BASE} ${A11Y.focusRingLight} ${
          active ? CATEGORY_RAIL_ITEM_ACTIVE : CATEGORY_RAIL_ITEM_INACTIVE
        }`}
      >
        <span className={CATEGORY_RAIL_LAVA_BAR} aria-hidden />
        <span
          className={`${CATEGORY_RAIL_ICON} ${
            active ? CATEGORY_RAIL_ICON_ACTIVE : "group-hover:text-neutral-300"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 pl-0.5">
          <span className={CATEGORY_RAIL_LABEL}>{label}</span>
          <span
            className={`${CATEGORY_RAIL_META} ${
              active ? CATEGORY_RAIL_META_ACTIVE : ""
            }`}
          >
            {toolsLabel}
          </span>
        </span>
      </button>
    </li>
  );
}

export default function CategoryRail({
  selectedId,
  onSelect,
  language = "en",
  className = "",
}: Props) {
  const isDe = language === "de";
  const buttonRefs = useRef(
    new Map<CreatorToolboxGroupId, HTMLButtonElement | null>()
  );

  const registerButton = useCallback(
    (el: HTMLButtonElement | null, id: CreatorToolboxGroupId) => {
      buttonRefs.current.set(id, el);
    },
    []
  );

  const focusCategory = useCallback((id: CreatorToolboxGroupId) => {
    buttonRefs.current.get(id)?.focus();
  }, []);

  useEffect(() => {
    const active = buttonRefs.current.get(selectedId);
    active?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedId]);

  const handleKeyNavigate = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentId: CreatorToolboxGroupId) => {
      const order = STUDIO_CATEGORY_ORDER;
      const index = order.indexOf(currentId);
      if (index < 0) return;

      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches;

      let nextIndex: number | null = null;

      if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = order.length - 1;
      } else if (event.key === "ArrowDown" && !isMobile) {
        nextIndex = (index + 1) % order.length;
      } else if (event.key === "ArrowUp" && !isMobile) {
        nextIndex = (index - 1 + order.length) % order.length;
      } else if (event.key === "ArrowRight" && isMobile) {
        nextIndex = (index + 1) % order.length;
      } else if (event.key === "ArrowLeft" && isMobile) {
        nextIndex = (index - 1 + order.length) % order.length;
      }

      if (nextIndex == null) return;

      event.preventDefault();
      const nextId = order[nextIndex]!;
      onSelect(nextId);
      focusCategory(nextId);
    },
    [focusCategory, onSelect]
  );

  return (
    <nav
      className={`${CATEGORY_RAIL_SHELL} ${className}`}
      aria-label={isDe ? "Workspace-Kategorien" : "Workspace categories"}
    >
      <p className={CATEGORY_RAIL_HEADER}>
        {isDe ? "Kategorien" : "Categories"}
      </p>
      <p className={CATEGORY_RAIL_HEADER_MOBILE}>
        {isDe ? "Kategorien" : "Categories"}
      </p>

      <div
        className="relative md:flex md:min-h-0 md:flex-1 md:flex-col"
        role="tablist"
        aria-label={isDe ? "Creator-Workflows" : "Creator workflows"}
      >
        <ul className={CATEGORY_RAIL_LIST}>
          {STUDIO_CATEGORY_ORDER.map((id) => {
            const copy = STUDIO_CATEGORY_COPY[id];
            const active = selectedId === id;
            const label = isDe ? copy.labelDe : copy.labelEn;
            const description = isDe ? copy.descriptionDe : copy.descriptionEn;
            const toolCount = getStudioCategory(id)?.toolIds.length ?? 0;

            return (
              <CategoryRailItem
                key={id}
                id={id}
                active={active}
                label={label}
                toolCount={toolCount}
                description={description}
                isDe={isDe}
                tabIndex={active ? 0 : -1}
                onSelect={onSelect}
                onKeyNavigate={handleKeyNavigate}
                buttonRef={registerButton}
              />
            );
          })}
        </ul>

        <div
          className="pointer-events-none absolute inset-x-0 right-0 top-0 h-full w-6 bg-gradient-to-l from-[#050505] to-transparent md:hidden"
          aria-hidden
        />
      </div>
    </nav>
  );
}
