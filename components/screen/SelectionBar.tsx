import { Icon } from "../Icon";
import styles from "./SelectionBar.module.css";

// Proposed extension: replaces the search bar while rows are selected. Not in the Figma design.
type SelectionBarProps = { count: number; onClear: () => void; onArchive: () => void; onDelete: () => void };

export function SelectionBar({ count, onClear, onArchive, onDelete }: SelectionBarProps) {
  return (
    <div className={styles.outer}>
      <div className={styles.bar} role="toolbar" aria-label={`${count} selected`}>
        <button type="button" className={styles.iconButton} onClick={onClear} aria-label="Clear selection">
          <Icon name="close" />
        </button>
        <span className={`${styles.count} text-title-large`}>{count}</span>
        <button type="button" className={styles.iconButton} onClick={onArchive} aria-label="Archive selected">
          <Icon name="archive" />
        </button>
        <button type="button" className={styles.iconButton} onClick={onDelete} aria-label="Delete selected">
          <Icon name="delete" />
        </button>
      </div>
    </div>
  );
}
