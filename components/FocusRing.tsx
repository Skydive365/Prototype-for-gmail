import styles from "./FocusRing.module.css";

// Figma: Focus ring — 3 px outside stroke, inset 3 px so it isn't clipped by the row.
export function FocusRing() {
  return <span className={styles.ring} aria-hidden="true" />;
}
