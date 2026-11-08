import { Icon, type IconName } from "../Icon";
import styles from "./NavBar.module.css";

// Figma: Navigation Bar (M3, 3 items). Mail is selected in the design and carries the unread badge.
export type NavTab = "mail" | "chat" | "meet";

const TABS: { id: NavTab; icon: IconName; label: string }[] = [
  { id: "mail", icon: "mail", label: "Mail" },
  { id: "chat", icon: "chat_bubble", label: "Chat" },
  { id: "meet", icon: "videocam", label: "Meet" },
];

type NavBarProps = { active: NavTab; unread: number; onChange: (tab: NavTab) => void };

export function NavBar({ active, unread, onChange }: NavBarProps) {
  return (
    <nav className={styles.bar} aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={styles.item}
          data-active={active === tab.id}
          aria-current={active === tab.id ? "page" : undefined}
          aria-label={tab.id === "mail" && unread ? `${tab.label}, ${unread} unread` : tab.label}
          onClick={() => onChange(tab.id)}
        >
          <span className={styles.indicator}>
            <Icon name={tab.icon} />
            {tab.id === "mail" && unread > 0 && <span className={`${styles.badge} text-label-small`}>{unread}</span>}
          </span>
        </button>
      ))}
    </nav>
  );
}
