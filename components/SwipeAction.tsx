import { Icon } from "./Icon";
import styles from "./SwipeAction.module.css";

// Figma: Swipe action (Action = Archive | Delete) — the colour revealed behind a swiped row.
export function SwipeAction({ action }: { action: "archive" | "delete" }) {
  return (
    <span className={styles.action} data-action={action} aria-hidden="true">
      <Icon name={action} className={styles.icon} />
    </span>
  );
}
