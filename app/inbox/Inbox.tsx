"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { EmailRow, type EmailRowProps } from "@/components/EmailRow";
import { CategoryLabel } from "@/components/screen/CategoryLabel";
import { ComposeFab } from "@/components/screen/ComposeFab";
import { GestureBar } from "@/components/screen/GestureBar";
import { ListHeader } from "@/components/screen/ListHeader";
import { NavBar, type NavTab } from "@/components/screen/NavBar";
import { SearchBar } from "@/components/screen/SearchBar";
import { SelectionBar } from "@/components/screen/SelectionBar";
import { StatusBar } from "@/components/screen/StatusBar";
import { INBOX, type InboxEmail } from "@/lib/inbox-data";
import styles from "./inbox.module.css";

type Row = InboxEmail & { swipe?: EmailRowProps["swipe"] };

const REMOVE_AFTER_MS = 250; // let the row finish snapping before it leaves the list

// Fit to screen: the phone is 884 px + 8 px bezel top and bottom; the controls above need ~110 px.
const PHONE_HEIGHT = 884 + 16;
const RESERVED_HEIGHT = 110;
const MIN_ZOOM = 0.5;

// Window height, kept in sync on resize (falls back to full size while rendering on the server)
function useWindowHeight() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    },
    () => window.innerHeight,
    () => PHONE_HEIGHT + RESERVED_HEIGHT,
  );
}

export function Inbox() {
  const [rows, setRows] = useState<Row[]>(INBOX);
  const [tab, setTab] = useState<NavTab>("mail");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fit, setFit] = useState(true);
  const windowHeight = useWindowHeight();
  const zoom = fit ? Math.max(MIN_ZOOM, Math.min(1, (windowHeight - RESERVED_HEIGHT) / PHONE_HEIGHT)) : 1;
  const avatarBefore = useRef(new Map<string, EmailRowProps["avatar"]>());

  const update = (id: string, change: (row: Row) => Row) => setRows((all) => all.map((r) => (r.id === id ? change(r) : r)));
  const remove = (ids: string[]) => setRows((all) => all.filter((r) => !ids.includes(r.id)));

  // Selecting shows the check-mark avatar (as in Figma's Selected variants); deselecting restores it
  const setSelected = (row: Row, selected: boolean): Row => {
    if (selected === Boolean(row.selected)) return row;
    if (selected) avatarBefore.current.set(row.id, row.avatar);
    return { ...row, selected, avatar: selected ? "checked" : avatarBefore.current.get(row.id) };
  };

  const selected = rows.filter((r) => r.selected);
  const unread = rows.filter((r) => r.status === "unread").length;
  const groups = [...new Set(rows.map((r) => r.group))];

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <h1 className={styles.title}>Inbox prototype</h1>
        <div className={styles.segmented} role="group" aria-label="Theme">
          {(["light", "dark"] as const).map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
        <button type="button" className={styles.reset} onClick={() => { setRows(INBOX); setTab("mail"); avatarBefore.current.clear(); }}>
          Reset
        </button>
        <div className={styles.segmented} role="group" aria-label="Phone size">
          <button type="button" aria-pressed={fit} onClick={() => setFit(true)}>
            Fit to screen{fit && zoom < 1 ? ` (${Math.round(zoom * 100)}%)` : ""}
          </button>
          <button type="button" aria-pressed={!fit} onClick={() => setFit(false)}>100%</button>
        </div>
        <Link href="/playground" className={styles.link}>Email row playground →</Link>
      </div>

      {/* CSS zoom shrinks the phone and the space it takes, so the whole screen fits in the window */}
      <div className={styles.phone} data-theme={theme} style={{ zoom }}>
        <StatusBar />
        {selected.length > 0 ? (
          <SelectionBar
            count={selected.length}
            onClear={() => setRows((all) => all.map((r) => setSelected(r, false)))}
            onArchive={() => remove(selected.map((r) => r.id))}
            onDelete={() => remove(selected.map((r) => r.id))}
          />
        ) : (
          <SearchBar />
        )}

        {tab === "mail" ? (
          <>
            <CategoryLabel />
            <div className={styles.list}>
              {rows.length === 0 && <p className={`${styles.empty} text-body-medium`}>You&apos;re all caught up</p>}
              {groups.map((group) => (
                <section key={group} aria-label={group}>
                  <ListHeader title={group} />
                  {rows.filter((r) => r.group === group).map((row) => (
                    <EmailRow
                      key={row.id}
                      {...row}
                      interactive
                      onTap={() => update(row.id, (r) => ({ ...r, status: "read" }))}
                      onLongPress={() => update(row.id, (r) => setSelected(r, !r.selected))}
                      onToggleStar={() => update(row.id, (r) => ({ ...r, starred: !r.starred }))}
                      onSwipe={(swipe) => {
                        update(row.id, (r) => ({ ...r, swipe }));
                        if (swipe !== "none") setTimeout(() => remove([row.id]), REMOVE_AFTER_MS);
                      }}
                    />
                  ))}
                </section>
              ))}
            </div>
            <div className={styles.fab}>
              <ComposeFab />
            </div>
          </>
        ) : (
          <div className={styles.list}>
            <p className={`${styles.empty} text-body-medium`}>{tab === "chat" ? "No chats yet" : "No meetings scheduled"}</p>
          </div>
        )}

        <NavBar active={tab} unread={unread} onChange={setTab} />
        <GestureBar />
      </div>
    </div>
  );
}
