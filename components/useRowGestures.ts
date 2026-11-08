"use client";

import { useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

// Interaction rules agreed for the playground (proposed extensions: Figma only has static variants).
export const SWIPE_OFFSET = 120; // Figma's Archive / Delete variants shift the row by 120 px
const SWIPE_COMMIT = 60; // release past this distance to snap open / closed
const LONG_PRESS_MS = 500;
const DRAG_START = 8; // movement before a press turns into a swipe

type Swipe = "none" | "archive" | "delete";
type LiveState = "hovered" | "pressed" | "focused";
type Options = {
  enabled: boolean;
  swipe: Swipe;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (swipe: Swipe) => void;
};

const restingOffset = (swipe: Swipe) => (swipe === "archive" ? SWIPE_OFFSET : swipe === "delete" ? -SWIPE_OFFSET : 0);

export function useRowGestures({ enabled, swipe, onTap, onLongPress, onSwipe }: Options) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [drag, setDrag] = useState<number | null>(null); // live offset while dragging

  const start = useRef<{ x: number; y: number; offset: number; zoom: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const offset = drag ?? restingOffset(swipe);

  if (!enabled) {
    return { offset, dragging: false, visualState: null as LiveState | null, handlers: {} };
  }

  // Ignore gestures that start on the star button
  const fromButton = (e: ReactPointerEvent) => (e.target as HTMLElement).closest("button") !== null;

  const handlers = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (fromButton(e) || e.button !== 0) return;
      // Keep receiving moves while dragging outside the row (can fail for a pointer that's already gone)
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      // If the row sits inside a CSS-zoomed area (e.g. the inbox "Fit to screen"), screen pixels ≠ row pixels
      const zoom = (e.currentTarget as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom ?? 1;
      start.current = { x: e.clientX, y: e.clientY, offset: restingOffset(swipe), zoom };
      longPressed.current = false;
      setPressed(true);
      clearTimer();
      timer.current = setTimeout(() => {
        longPressed.current = true;
        setPressed(false);
        onLongPress?.();
      }, LONG_PRESS_MS);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (!start.current) return;
      const dx = (e.clientX - start.current.x) / start.current.zoom;
      const dy = (e.clientY - start.current.y) / start.current.zoom;
      if (drag === null && Math.abs(dx) < DRAG_START) return;
      if (drag === null && Math.abs(dy) > Math.abs(dx)) return; // vertical movement: let the page scroll
      clearTimer();
      setPressed(false);
      const next = Math.max(-SWIPE_OFFSET * 1.5, Math.min(SWIPE_OFFSET * 1.5, start.current.offset + dx));
      setDrag(next);
    },
    onPointerUp: () => {
      const s = start.current;
      clearTimer();
      setPressed(false);
      start.current = null;
      if (!s) return;

      if (drag !== null) {
        // Swipe released: snap to the nearest Figma position
        const moved = drag - s.offset;
        let result: Swipe = swipe;
        if (swipe === "none" && Math.abs(drag) > SWIPE_COMMIT) result = drag > 0 ? "archive" : "delete";
        else if (swipe !== "none" && Math.abs(moved) > SWIPE_COMMIT) result = "none";
        setDrag(null);
        if (result !== swipe) onSwipe?.(result);
        return;
      }
      if (longPressed.current) return;
      if (swipe !== "none") onSwipe?.("none"); // tap a swiped row to close it
      else onTap?.();
    },
    onPointerCancel: () => {
      clearTimer();
      setPressed(false);
      setDrag(null);
      start.current = null;
    },
    onFocus: (e: FocusEvent<HTMLElement>) => setFocused(e.currentTarget.matches(":focus-visible")),
    onBlur: () => setFocused(false),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      if (swipe !== "none") onSwipe?.("none");
      else onTap?.();
    },
  };

  // Which Figma State the row should show right now
  const visualState: LiveState | null = pressed ? "pressed" : focused ? "focused" : hovered && drag === null ? "hovered" : null;
  return { offset, dragging: drag !== null, visualState, handlers };
}
