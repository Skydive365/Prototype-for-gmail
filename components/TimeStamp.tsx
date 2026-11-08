import { Icon } from "./Icon";
import styles from "./TimeStamp.module.css";

// Figma: Time stamp (Type = Time | Snoozed | Scheduled, Emphasis = Regular | Emphasized)
export type TimeStampType = "time" | "snoozed" | "scheduled";

type TimeStampProps = {
  time: string;
  type?: TimeStampType;
  /** Emphasized is used on unread rows. */
  emphasized?: boolean;
  onSelected?: boolean;
};

export function TimeStamp({ time, type = "time", emphasized = false, onSelected = false }: TimeStampProps) {
  const textStyle = emphasized ? "text-label-small-emphasized" : "text-label-small-regular";
  return (
    <span className={styles.timeStamp} data-emphasized={emphasized} data-on-selected={onSelected}>
      {type === "snoozed" && <Icon name="snooze" size={16} className={styles.icon} />}
      {type === "scheduled" && <Icon name="schedule" size={16} className={styles.icon} />}
      <span className={textStyle}>{time}</span>
    </span>
  );
}
