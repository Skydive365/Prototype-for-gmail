import styles from "./LabelChip.module.css";

// Figma: Label chip (text property "Label")
export function LabelChip({ label }: { label: string }) {
  return <span className={`${styles.chip} text-label-small`}>{label}</span>;
}
