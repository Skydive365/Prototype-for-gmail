import styles from "./StatusBar.module.css";

// Figma: Status bar (M3 building block). Time "9:30" is Roboto Medium 14 with no text style in Figma,
// so it uses the typography tokens directly. Icon shapes are the kit's vectors.
export function StatusBar({ time = "9:30" }: { time?: string }) {
  return (
    <div className={styles.bar} aria-hidden="true">
      <span className={styles.time}>{time}</span>
      <svg className={styles.cutout} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" /></svg>
      <svg className={styles.icons} viewBox="0 0 46 17">
        {/* wifi (10 % in the kit), signal, battery (base 30 % + charge) */}
        <path opacity="0.1" d="M8.5 1C5.1 1 2.125 2.488 0 4.825L8.5 15.167 17 4.825C14.875 2.488 11.9 1 8.5 1Z" />
        <path d="M31.167 1 17 15.167h14.167V1Z" />
        <path opacity="0.3" d="M43.5 1h-3v1.5H39c-.552 0-1 .504-1 1.125v11.25c0 .621.448 1.125 1 1.125h6c.552 0 1-.504 1-1.125V3.625c0-.621-.448-1.125-1-1.125h-1.5V1Z" />
        <path d="M38 9v5.95c0 .58.448 1.05 1 1.05h6c.552 0 1-.47 1-1.05V9h-8Z" />
      </svg>
    </div>
  );
}
