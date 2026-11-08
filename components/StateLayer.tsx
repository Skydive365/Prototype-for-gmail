import styles from "./StateLayer.module.css";

// Figma: State layer (State = Hovered | Focused | Pressed) — stretches over the whole row.
export function StateLayer({ state }: { state: "hovered" | "focused" | "pressed" }) {
  return (
    <span className={styles.layer} data-state={state} aria-hidden="true">
      {state === "pressed" && (
        // M3 ripple shape at (72.1, 37.4), clipped by the row
        <svg className={styles.ripple} viewBox="0 0 432.6 59.4" aria-hidden="true">
          <path d="M432.6 6.6271V52.9784C432.6 56.5249 418.253 59.4 400.556 59.4H0C0 26.5943 132.708 0 296.411 0C345.51 0 391.822 2.39235 432.6 6.6271Z" />
        </svg>
      )}
    </span>
  );
}
