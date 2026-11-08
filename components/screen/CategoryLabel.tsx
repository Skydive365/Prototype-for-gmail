import styles from "./CategoryLabel.module.css";

// Figma: "Primary" label (M3 Text button, 48 px high) above the list
export function CategoryLabel({ label = "Primary" }: { label?: string }) {
  return (
    <div className={styles.row}>
      <span className={`${styles.label} text-label-large`}>{label}</span>
    </div>
  );
}
