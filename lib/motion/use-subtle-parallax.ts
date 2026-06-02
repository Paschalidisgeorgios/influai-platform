"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { useReducedMotion } from "framer-motion";

export type ParallaxLayerConfig = {
  /** Depth multiplier — higher layers shift more (typical 0.25–1). */
  depth: number;
  /** Per-layer cap in px (overrides global maxPx). */
  maxPx?: number;
};

export type UseSubtleParallaxOptions = {
  /** Cap translation in px at depth 1. */
  maxPx?: number;
  /** Global intensity 0–1. */
  strength?: number;
  /** Disable parallax (e.g. modal open). */
  disabled?: boolean;
  /** Smoothing factor per frame (lower = silkier). */
  smoothing?: number;
};

export type UseSubtleParallaxResult<T extends HTMLElement = HTMLElement> = {
  containerRef: RefObject<T | null>;
  enabled: boolean;
  getLayerStyle: (layer: ParallaxLayerConfig) => CSSProperties;
};

/**
 * Mouse-reactive offset for decorative layers only.
 * Attach containerRef to a stable inner panel — never the page shell or sidebar.
 */
export function useSubtleParallax<T extends HTMLElement = HTMLElement>(
  options: UseSubtleParallaxOptions = {}
): UseSubtleParallaxResult<T> {
  const {
    maxPx = 12,
    strength = 1,
    disabled = false,
    smoothing = 0.1,
  } = options;

  const reduceMotion = useReducedMotion();
  const enabled = !disabled && !reduceMotion;

  const containerRef = useRef<T | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (event: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (event.clientX - cx) / (rect.width / 2);
      const ny = (event.clientY - cy) / (rect.height / 2);

      targetRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
    },
    []
  );

  const onLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    if (!enabled) {
      targetRef.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    let frame = 0;
    const tick = () => {
      setOffset((current) => {
        const target = targetRef.current;
        const nextX = current.x + (target.x - current.x) * smoothing;
        const nextY = current.y + (target.y - current.y) * smoothing;
        if (
          Math.abs(nextX - current.x) < 0.0005 &&
          Math.abs(nextY - current.y) < 0.0005 &&
          Math.abs(target.x) < 0.0005 &&
          Math.abs(target.y) < 0.0005
        ) {
          return current;
        }
        return { x: nextX, y: nextY };
      });
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled, onMove, onLeave, smoothing]);

  const getLayerStyle = useCallback(
    (layer: ParallaxLayerConfig): CSSProperties => {
      if (!enabled) return {};
      const cap = (layer.maxPx ?? maxPx) * strength * layer.depth;
      return {
        transform: `translate3d(${offset.x * cap}px, ${offset.y * cap}px, 0)`,
        willChange: "transform",
      };
    },
    [enabled, offset, maxPx, strength]
  );

  return { containerRef, enabled, getLayerStyle };
}
