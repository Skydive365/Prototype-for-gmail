import { Icon } from "../Icon";
import styles from "./ComposeFab.module.css";

// Figma: Compose FAB (proposed extension, M3 extended FAB)
export function ComposeFab({ label = "Compose", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button type="button" className={styles.fab} onClick={onClick}>
      <Icon name="edit" />
      <span className="text-label-large">{label}</span>
    </button>
  );
}
