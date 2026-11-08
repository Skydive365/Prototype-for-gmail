import { Icon } from "./Icon";
import styles from "./Avatar.module.css";

// Figma: Avatar (Type = Letter | Logo | No photo | Checked)
export type AvatarType = "letter" | "logo" | "no-photo" | "checked";
// Background options for the Letter type, from the overrides used in the Email row.
export type AvatarColor = "default" | "green" | "orange";

type AvatarProps = {
  type?: AvatarType;
  /** Letter type only. Exposed in Figma as the nested avatar's "Letter" property. */
  letter?: string;
  color?: AvatarColor;
};

export function Avatar({ type = "letter", letter = "A", color = "default" }: AvatarProps) {
  if (type === "no-photo") {
    return (
      <span className={`${styles.avatar} ${styles.noPhoto}`}>
        <Icon name="person" />
      </span>
    );
  }

  if (type === "checked") {
    return (
      <span className={`${styles.avatar} ${styles.default}`}>
        {/* M3 kit "Icons/check_24px": 24.2 × 24.2 at (8, 8) */}
        <svg className={styles.check} viewBox="0 0 24.2085 24.2085" fill="currentColor" aria-hidden="true">
          <path d="M9.07801 16.3105L4.87179 12.1042L3.43945 13.5265L9.07801 19.165L21.1823 7.0608L19.76 5.63855L9.07801 16.3105Z" />
        </svg>
      </span>
    );
  }

  if (type === "logo") {
    return (
      <span className={`${styles.avatar} ${styles.default}`}>
        {/* M3 kit "Avatar Placeholder": 28.2 × 25.6 at (5.9, 10) */}
        <svg className={styles.placeholder} viewBox="0 0 28.1841 25.6321" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M20.092 6C20.092 9.31371 17.4058 12 14.092 12C10.7783 12 8.09204 9.31371 8.09204 6C8.09204 2.68629 10.7783 0 14.092 0C17.4058 0 20.092 2.68629 20.092 6ZM18.092 6C18.092 8.20914 16.3012 10 14.092 10C11.8829 10 10.092 8.20914 10.092 6C10.092 3.79086 11.8829 2 14.092 2C16.3012 2 18.092 3.79086 18.092 6Z" />
          <path d="M14.092 15C7.61766 15 2.10132 18.8284 0 24.192C0.511895 24.7004 1.05114 25.1812 1.61533 25.6321C3.18007 20.7077 8.08876 17 14.092 17C20.0953 17 25.004 20.7077 26.5688 25.6321C27.133 25.1812 27.6722 24.7004 28.1841 24.1921C26.0828 18.8284 20.5664 15 14.092 15Z" />
        </svg>
      </span>
    );
  }

  return (
    <span className={`${styles.avatar} ${styles.letter} ${styles[color]}`}>
      {letter.slice(0, 1).toUpperCase()}
    </span>
  );
}
