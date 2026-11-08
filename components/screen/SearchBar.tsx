import { Icon } from "../Icon";
import styles from "./SearchBar.module.css";

// Figma: Search bar (local component built from the M3 App bar)
export function SearchBar({ placeholder = "search in mail", accountLetter = "A" }: { placeholder?: string; accountLetter?: string }) {
  return (
    <div className={styles.outer}>
      <div className={styles.bar} role="search">
        <button type="button" className={styles.iconButton} aria-label="Open menu">
          <Icon name="menu" />
        </button>
        <span className={`${styles.placeholder} text-title-large`}>{placeholder}</span>
        <span className={styles.trailing}>
          <span className={`${styles.avatar} text-title-medium`} aria-label="Account">{accountLetter}</span>
        </span>
      </div>
    </div>
  );
}
