"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GENERATOR_OVERLAY_COPY } from "@/lib/studio/generator-overlay-copy";
import { AgentVisualEffectsProvider } from "@/lib/studio/agent-visual-effects-context";
import GeneratorOverlayEffectsLayer from "./GeneratorOverlayEffectsLayer";

const EASE_OUT = [0, 0, 0.2, 1] as const;
const OPEN_MS = 0.2;

const BACKDROP_CLASS =
  "fixed inset-0 z-50 bg-black/75 backdrop-blur-[8px]";

const PANEL_CLASS =
  "fixed left-1/2 top-1/2 z-[51] flex w-[90vw] max-w-[860px] flex-col overflow-hidden rounded-2xl border border-[rgba(255,165,0,0.25)] bg-[#0a0a0a] shadow-[0_0_60px_rgba(255,140,0,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/35 max-h-[85vh] -translate-x-1/2 -translate-y-1/2";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Sticky top — tool icon, name, cost badge, close. */
  header?: ReactNode;
  /** Sticky bottom — preview + primary CTA. */
  footer?: ReactNode;
  /** Scrollable body — prompt, timeline, visual stage. */
  children: ReactNode;
  ariaLabel?: string;
  language?: "en" | "de";
  /** Block dismiss (ESC, overlay click, close) while a paid render is running. */
  isRenderInProgress?: boolean;
  /** Element that opened the overlay — focus returns here on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Intensify in-overlay Lava-Amber ambience while generating. */
  isGenerating?: boolean;
};

/**
 * Centered generator overlay — backdrop dim/blur, focus trap, body scroll lock.
 *
 * Structure:
 * - HEADER (sticky): icon · tool name · cost badge · close
 * - BODY (scroll): prompt · agent timeline · visual stage
 * - FOOTER (sticky): preview + primary action
 */
export default function GeneratorOverlay({
  open,
  onOpenChange,
  title,
  description,
  header,
  footer,
  children,
  ariaLabel,
  language = "en",
  isRenderInProgress = false,
  returnFocusRef,
  isGenerating = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isDe = language === "de";
  const contentRef = useRef<HTMLDivElement>(null);

  const dialogLabel =
    ariaLabel ??
    title ??
    (isDe
      ? GENERATOR_OVERLAY_COPY.dialogLabel.de
      : GENERATOR_OVERLAY_COPY.dialogLabel.en);

  const defaultDescription = isDe
    ? GENERATOR_OVERLAY_COPY.dialogDescription.de
    : GENERATOR_OVERLAY_COPY.dialogDescription.en;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && isRenderInProgress) return;
      onOpenChange(next);
    },
    [isRenderInProgress, onOpenChange]
  );

  const blockDismissInteraction = useCallback(
    (event: Event) => {
      if (isRenderInProgress) {
        event.preventDefault();
      }
    },
    [isRenderInProgress]
  );

  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      const target = returnFocusRef?.current;
      if (!target) return;
      event.preventDefault();
      requestAnimationFrame(() => {
        target.focus({ preventScroll: true });
      });
    },
    [returnFocusRef]
  );

  const handleOpenAutoFocus = useCallback((event: Event) => {
    const root = contentRef.current;
    if (!root) return;

    const preferred = root.querySelector<HTMLElement>(
      '[data-generator-overlay-initial-focus] textarea, [data-generator-overlay-initial-focus] input:not([type="hidden"]), textarea, input:not([type="hidden"]), button:not([disabled])'
    );

    if (preferred) {
      event.preventDefault();
      requestAnimationFrame(() => {
        preferred.focus({ preventScroll: true });
      });
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [open]);

  const backdropMotion = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: OPEN_MS, ease: EASE_OUT },
      };

  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
      }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration: OPEN_MS, ease: EASE_OUT },
      };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className={BACKDROP_CLASS} {...backdropMotion} />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby="generator-overlay-desc"
              onEscapeKeyDown={blockDismissInteraction}
              onPointerDownOutside={blockDismissInteraction}
              onInteractOutside={blockDismissInteraction}
              onCloseAutoFocus={handleCloseAutoFocus}
              onOpenAutoFocus={handleOpenAutoFocus}
            >
              <motion.div
                ref={contentRef}
                className={PANEL_CLASS}
                {...panelMotion}
              >
                <Dialog.Description
                  id="generator-overlay-desc"
                  className="sr-only"
                >
                  {description ?? defaultDescription}
                </Dialog.Description>

                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                {header ??
                  (title ? (
                    <header className="sticky top-0 z-10 shrink-0 border-b border-[rgba(255,165,0,0.15)] bg-[#0a0a0a] px-4 py-3 sm:px-5 sm:py-4">
                      <Dialog.Title className="text-base font-bold text-white sm:text-lg">
                        {title}
                      </Dialog.Title>
                    </header>
                  ) : null)}

                <AgentVisualEffectsProvider enabled>
                  <div
                    className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
                    aria-label={dialogLabel}
                    data-generator-overlay-effects=""
                  >
                    <GeneratorOverlayEffectsLayer
                      isGenerating={isGenerating || isRenderInProgress}
                    />

                    <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
                      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5">
                        {children}
                      </div>
                      {footer}
                    </div>
                  </div>
                </AgentVisualEffectsProvider>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export type { Props as GeneratorOverlayProps };
