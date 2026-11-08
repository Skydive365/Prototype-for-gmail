"use client"; // has a click handler, so it runs in the browser

import { Icon } from "./Icon";
import styles from "./StarButton.module.css";

// Figma: Star button (Starred = False | True, State = Enabled | Hovered | Focused | Pressed)
export type InteractionState = "enabled" | "hovered" | "focused" | "pressed";

type StarButtonProps = {
  starred?: boolean;
  state?: InteractionState;
  /** On a selected row the outline star uses the on-selected colour. */
  onSelected?: boolean;
  onToggle?: () => void;
};

export function StarButton({ starred = false, state = "enabled", onSelected = false, onToggle }: StarButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      data-state={state}
      data-starred={starred}
      data-on-selected={onSelected}
      aria-pressed={starred}
      aria-label={starred ? "Unstar" : "Star"}
      onClick={(event) => {
        event.stopPropagation();
        onToggle?.();
      }}
    >
      {/* 40 × 40 visual, 48 × 48 touch target centred on it */}
      <span className={styles.target} aria-hidden="true" />
      <span className={styles.stateLayer}>
        {state === "pressed" && (
          <svg className={styles.ripple} viewBox="0 0 38 28" aria-hidden="true">
            <path d="M38 3.12389V28H0C0 12.536 11.6572 0 26.037 0C30.35 0 34.418 1.12771 38 3.12389Z" />
          </svg>
        )}
        <Icon name={starred ? "star_filled" : "star"} className={styles.icon} />
      </span>
    </button>
  );
}
