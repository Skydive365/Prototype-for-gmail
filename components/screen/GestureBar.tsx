import styles from "./GestureBar.module.css";

// Figma: Gesture bar (M3 building block): 24 px bar with a 108 × 4 handle
export function GestureBar() {
  return (
    <div className={styles.bar} aria-hidden="true">
      <span className={styles.handle} />
    </div>
  );
}
