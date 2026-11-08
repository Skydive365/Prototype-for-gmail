import { Icon } from "./Icon";
import styles from "./AttachmentChip.module.css";

// Figma: Attachment chip (wraps the M3 Assistive chip, Outlined, Label & icon)
export function AttachmentChip({ name }: { name: string }) {
  return (
    <span className={styles.chip}>
      <Icon name="image" className={styles.icon} />
      <span className={`${styles.label} text-label-large`}>{name}</span>
    </span>
  );
}
