import styles from "./ListHeader.module.css";

// Group header ("Today", "Yesterday"): proposed extension, same as the one /email-list creates in Figma
export function ListHeader({ title }: { title: string }) {
  return <div className={`${styles.header} text-label-small`}>{title}</div>;
}
