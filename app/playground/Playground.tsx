"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { EmailRow, type EmailRowProps } from "@/components/EmailRow";
import { FIGMA_VARIANTS, matchVariant } from "@/lib/figma-variants";
import { textStylesUsedIn, tokensUsedIn, type TokenInfo } from "@/lib/token-lookup";
import styles from "./playground.module.css";

const FIGMA_URL = "https://www.figma.com/design/jgw8Iiwb7rKZjZj8pBDWB7/Learn-AI-workflow?node-id=97-29397";
const WIDTHS = [360, 390, 412, 430];

// Controls mirror the Figma component properties exactly (value → Figma label).
const VARIANT_CONTROLS = [
  { key: "state", label: "State", options: { enabled: "Enabled", hovered: "Hovered", focused: "Focused", pressed: "Pressed" } },
  { key: "status", label: "Status", options: { read: "Read", unread: "Unread" } },
  { key: "content", label: "Content", options: { default: "Default", attachment: "Attachment", draft: "Draft", "message-count": "Message count", "label-chip": "Label chip", tracking: "Tracking", important: "Important", snoozed: "Snoozed", scheduled: "Scheduled", "long-text": "Long text" } },
  { key: "avatar", label: "Avatar", options: { letter: "Letter", "no-photo": "No photo", logo: "Logo", checked: "Checked" } },
  { key: "swipe", label: "Swipe", options: { none: "None", archive: "Archive", delete: "Delete" } },
] as const;

const TEXT_KEYS = ["sender", "subject", "snippet", "time", "avatarLetter", "attachmentName", "moreFiles", "messageCount", "label", "trackingText"] as const;

type Tab = "usage" | "code" | "tokens";

export function Playground({ sources }: { sources: Record<string, string> }) {
  const [props, setProps] = useState<EmailRowProps>(FIGMA_VARIANTS[0].props);
  const [width, setWidth] = useState(412);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [compare, setCompare] = useState<"side" | "overlay">("side");
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [difference, setDifference] = useState(false);
  const [tab, setTab] = useState<Tab>("usage");
  const [file, setFile] = useState("components/EmailRow.tsx");

  const set = <K extends keyof EmailRowProps>(key: K, value: EmailRowProps[K]) => setProps((p) => ({ ...p, [key]: value }));

  // Interaction rules (proposed extensions, agreed for the playground)
  const avatarBeforeSelect = useRef<EmailRowProps["avatar"]>("letter");
  const interactions = {
    // Tap = open the email in Gmail, so an unread row becomes read
    onTap: () => set("status", "read"),
    // Long press toggles selection; Figma's Selected variants always show the check-mark avatar
    onLongPress: () =>
      setProps((p) => {
        if (p.selected) return { ...p, selected: false, avatar: avatarBeforeSelect.current };
        avatarBeforeSelect.current = p.avatar === "checked" ? "letter" : p.avatar;
        return { ...p, selected: true, avatar: "checked" };
      }),
    onSwipe: (swipe: EmailRowProps["swipe"]) => set("swipe", swipe),
    onToggleStar: () => setProps((p) => ({ ...p, starred: !p.starred })),
  };

  const variant = matchVariant(props);
  const textsDiffer = variant ? TEXT_KEYS.some((k) => (variant.props[k] ?? "") !== (props[k] ?? "")) || props.avatarColor !== variant.props.avatarColor : false;

  const { tokens, textStyles } = useMemo(() => {
    const css = Object.entries(sources).filter(([f]) => f.endsWith(".css")).map(([, c]) => c).join("\n");
    const tsx = Object.entries(sources).filter(([f]) => f.endsWith(".tsx")).map(([, c]) => c).join("\n");
    return { tokens: tokensUsedIn(css), textStyles: textStylesUsedIn(tsx) };
  }, [sources]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Email row playground</h1>
          <p className={styles.subtitle}>
            React component built from the Figma tokens · <a href={FIGMA_URL} target="_blank" rel="noreferrer">Open in Figma</a> ·{" "}
            <Link href="/inbox">Inbox prototype</Link>
          </p>
        </div>
        <div className={styles.segmented} role="group" aria-label="Theme">
          {(["light", "dark"] as const).map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section className={styles.group}>
            <h2>Figma variant preset</h2>
            <select
              value={variant?.slug ?? ""}
              onChange={(e) => {
                const v = FIGMA_VARIANTS.find((x) => x.slug === e.target.value);
                if (v) {
                  setProps({ ...v.props });
                  setWidth(412);
                }
              }}
            >
              {!variant && <option value="">Custom combination</option>}
              {FIGMA_VARIANTS.map((v) => (
                <option key={v.slug} value={v.slug}>{v.label}</option>
              ))}
            </select>
            <p className={styles.hint}>Loads one of the 23 variants with its exact Figma content.</p>
          </section>

          <section className={styles.group}>
            <h2>Variant properties</h2>
            {VARIANT_CONTROLS.map((c) => (
              <label key={c.key} className={styles.field}>
                <span>{c.label}</span>
                <select value={String(props[c.key] ?? "")} onChange={(e) => set(c.key, e.target.value as never)}>
                  {Object.entries(c.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className={styles.check}>
              <input type="checkbox" checked={Boolean(props.starred)} onChange={(e) => set("starred", e.target.checked)} />
              <span>Starred</span>
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={Boolean(props.selected)} onChange={(e) => set("selected", e.target.checked)} />
              <span>Selected</span>
            </label>
          </section>

          <section className={styles.group}>
            <h2>Text properties</h2>
            <TextField label="Sender" value={props.sender} onChange={(v) => set("sender", v)} />
            <TextField label="Subject" value={props.subject} onChange={(v) => set("subject", v)} />
            <TextField label="Snippet" value={props.snippet} onChange={(v) => set("snippet", v)} multiline />
          </section>

          <section className={styles.group}>
            <h2>Nested (exposed in Figma)</h2>
            <TextField label="Time stamp → Time" value={props.time} onChange={(v) => set("time", v)} />
            {props.avatar === "letter" && (
              <>
                <TextField label="Avatar → Letter" value={props.avatarLetter ?? ""} onChange={(v) => set("avatarLetter", v)} />
                <label className={styles.field}>
                  <span>Avatar colour</span>
                  <select value={props.avatarColor} onChange={(e) => set("avatarColor", e.target.value as EmailRowProps["avatarColor"])}>
                    <option value="green">Green</option>
                    <option value="orange">Orange</option>
                    <option value="default">Default (violet)</option>
                  </select>
                </label>
              </>
            )}
          </section>

          {["attachment", "message-count", "label-chip", "tracking"].includes(props.content ?? "") && (
            <section className={styles.group}>
              <h2>Content text</h2>
              <p className={styles.hint}>Text inside this Content variant in Figma. Not a component property there.</p>
              {props.content === "attachment" && (
                <>
                  <TextField label="File name" value={props.attachmentName ?? ""} onChange={(v) => set("attachmentName", v)} />
                  <TextField label="More files" value={props.moreFiles ?? ""} onChange={(v) => set("moreFiles", v)} />
                </>
              )}
              {props.content === "message-count" && <TextField label="Message count" value={props.messageCount ?? ""} onChange={(v) => set("messageCount", v)} />}
              {props.content === "label-chip" && <TextField label="Label" value={props.label ?? ""} onChange={(v) => set("label", v)} />}
              {props.content === "tracking" && <TextField label="Tracking text" value={props.trackingText ?? ""} onChange={(v) => set("trackingText", v)} />}
            </section>
          )}

        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <span className={styles.toolbarLabel}>Width</span>
            <div className={styles.segmented} role="group" aria-label="Preview width">
              {WIDTHS.map((w) => (
                <button key={w} type="button" aria-pressed={width === w} onClick={() => setWidth(w)}>{w}</button>
              ))}
            </div>
            <input
              className={styles.widthInput}
              type="number"
              min={280}
              max={600}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) || 412)}
              aria-label="Custom width in pixels"
            />
            <span className={styles.toolbarLabel}>px</span>
          </div>

          {!variant && (
            <p className={styles.notice} data-tone="warn">
              <strong>Proposed extension.</strong> This combination of variant properties doesn&apos;t exist in Figma, so the code
              is combining rules from separate variants. Check it with the designer before using it.
            </p>
          )}

          <div className={styles.stage}>
            <div className={styles.device} style={{ width }} data-theme={theme}>
              <EmailRow {...props} interactive {...interactions} />
            </div>
          </div>
          <p className={styles.hint}>
            Try it: hover · tap to mark as read · press and hold to select · drag left or right to swipe (tap or drag back to
            close) · Tab key for focus · star to toggle. These behaviours are proposed extensions: Figma only defines how each state looks.
          </p>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Compare with Figma</h2>
              {variant && (
                <div className={styles.segmented} role="group" aria-label="Compare mode">
                  <button type="button" aria-pressed={compare === "side"} onClick={() => setCompare("side")}>Side by side</button>
                  <button type="button" aria-pressed={compare === "overlay"} onClick={() => setCompare("overlay")}>Overlay</button>
                </div>
              )}
            </div>

            {!variant ? (
              <p className={styles.hint}>No Figma reference for this combination.</p>
            ) : (
              <>
                {(width !== 412 || textsDiffer || theme === "dark") && (
                  <p className={styles.notice}>
                    For an exact comparison use width 412, Light theme and the preset&apos;s original text
                    {textsDiffer ? " (text or avatar colour has been edited)" : ""}.
                  </p>
                )}
                {compare === "side" ? (
                  <div className={styles.sideBySide}>
                    <figure>
                      <figcaption>Code (browser)</figcaption>
                      <div className={styles.refFrame} data-theme={theme}>
                        <div style={{ width: 412 }}>
                          <EmailRow {...props} interactive={false} />
                        </div>
                      </div>
                    </figure>
                    <figure>
                      <figcaption>Figma · {variant.label}</figcaption>
                      <div className={styles.refFrame}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/figma-ref/${variant.slug}.png`} width={412} alt={`Figma variant: ${variant.label}`} />
                      </div>
                    </figure>
                  </div>
                ) : (
                  <>
                    <div className={styles.overlayControls}>
                      <label>
                        Figma opacity
                        <input type="range" min={0} max={1} step={0.05} value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} />
                      </label>
                      <label className={styles.check}>
                        <input type="checkbox" checked={difference} onChange={(e) => setDifference(e.target.checked)} />
                        <span>Difference blend (identical pixels turn black)</span>
                      </label>
                    </div>
                    <div className={styles.overlay} data-theme={theme}>
                      <div style={{ width: 412 }}>
                        <EmailRow {...props} interactive={false} />
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/figma-ref/${variant.slug}.png`}
                        width={412}
                        alt=""
                        style={{ opacity: difference ? 1 : overlayOpacity, mixBlendMode: difference ? "difference" : "normal" }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.tabs} role="tablist">
              {([["usage", "Usage"], ["code", "React & CSS"], ["tokens", `Tokens (${tokens.length})`]] as const).map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            {tab === "usage" && <pre className={styles.code}>{usageSnippet(props)}</pre>}

            {tab === "code" && (
              <>
                <div className={styles.fileList}>
                  {Object.keys(sources).map((f) => (
                    <button key={f} type="button" aria-pressed={file === f} onClick={() => setFile(f)}>{f.replace("components/", "")}</button>
                  ))}
                </div>
                <pre className={styles.code}>{sources[file]}</pre>
              </>
            )}

            {tab === "tokens" && (
              <>
                <h3 className={styles.tableTitle}>Text styles</h3>
                <table className={styles.table}>
                  <thead><tr><th>Figma text style</th><th>CSS class</th><th>Built from</th></tr></thead>
                  <tbody>
                    {textStyles.map((s) => (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td><code>.{s.className}</code></td>
                        <td>{s.tokens.map((t) => `${t.figmaName.replace("font/", "")} (${t.light})`).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h3 className={styles.tableTitle}>Variables</h3>
                <table className={styles.table}>
                  <thead><tr><th>CSS variable</th><th>Figma variable</th><th>Collection</th><th>Light</th><th>Dark</th></tr></thead>
                  <tbody>
                    {tokens.map((t) => (
                      <tr key={t.cssVar}>
                        <td><code>{t.cssVar}</code></td>
                        <td>{t.figmaName}{t.alias && <span className={styles.alias}> → {t.alias}</span>}</td>
                        <td>{t.collection}</td>
                        <td><Value value={t.light} /></td>
                        <td>{t.dark ? <Value value={t.dark} /> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} /> : <input value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

function Value({ value }: { value: TokenInfo["light"] }) {
  const isColor = value.startsWith("#");
  return (
    <span className={styles.value}>
      {isColor && <span className={styles.swatch} style={{ background: value }} />}
      {value}
    </span>
  );
}

// JSX a developer would write for the current settings (defaults left out).
function usageSnippet(p: EmailRowProps) {
  const defaults: Partial<EmailRowProps> = { state: "enabled", status: "read", starred: false, selected: false, content: "default", avatar: "letter", swipe: "none" };
  const lines = Object.entries(p)
    .filter(([k, v]) => v !== undefined && defaults[k as keyof EmailRowProps] !== v)
    .filter(([k]) => !(p.avatar !== "letter" && (k === "avatarLetter" || k === "avatarColor")))
    .map(([k, v]) => (typeof v === "boolean" ? `  ${k}` : `  ${k}=${JSON.stringify(v)}`));
  return `import { EmailRow } from "@/components/EmailRow";\n\n<EmailRow\n${lines.join("\n")}\n/>`;
}
