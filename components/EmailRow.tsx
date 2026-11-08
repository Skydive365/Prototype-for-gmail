"use client"; // handles pointer gestures, so it runs in the browser

import { Avatar, type AvatarColor, type AvatarType } from "./Avatar";
import { AttachmentChip } from "./AttachmentChip";
import { FocusRing } from "./FocusRing";
import { Icon } from "./Icon";
import { LabelChip } from "./LabelChip";
import { StarButton, type InteractionState } from "./StarButton";
import { StateLayer } from "./StateLayer";
import { SwipeAction } from "./SwipeAction";
import { TimeStamp } from "./TimeStamp";
import { useRowGestures } from "./useRowGestures";
import styles from "./EmailRow.module.css";

// Figma "Email row" variant property: Content
export type EmailRowContent =
  | "default"
  | "attachment"
  | "draft"
  | "message-count"
  | "label-chip"
  | "tracking"
  | "important"
  | "snoozed"
  | "scheduled"
  | "long-text";

export type EmailRowProps = {
  // Figma variant properties
  state?: InteractionState;
  status?: "read" | "unread";
  starred?: boolean;
  selected?: boolean;
  content?: EmailRowContent;
  avatar?: AvatarType;
  swipe?: "none" | "archive" | "delete";

  // Figma text properties
  sender: string;
  subject: string;
  snippet: string;

  // Exposed nested instances (Avatar → Letter, Time stamp → Time)
  avatarLetter?: string;
  avatarColor?: AvatarColor;
  time: string;

  // Text that lives inside specific Content variants in Figma (not component properties)
  attachmentName?: string;
  moreFiles?: string;
  messageCount?: string;
  label?: string;
  trackingText?: string;

  // Code-only interaction (proposed extensions; Figma has static variants only)
  /** Real hover / press / focus feedback and gestures. Off for static Figma comparisons. */
  interactive?: boolean;
  /** Tap or Enter / Space on the row. */
  onTap?: () => void;
  /** Press and hold for 0.5 s. */
  onLongPress?: () => void;
  /** Drag past 60 px to snap open at 120 px; tap or drag back to close. */
  onSwipe?: (swipe: "none" | "archive" | "delete") => void;
  onToggleStar?: () => void;
};

export function EmailRow(props: EmailRowProps) {
  const { swipe = "none", state = "enabled", interactive = false, onTap, onLongPress, onSwipe } = props;
  const { offset, dragging, visualState, handlers } = useRowGestures({ enabled: interactive, swipe, onTap, onLongPress, onSwipe });

  // A state chosen in Figma terms wins; otherwise show live feedback while the row is at rest.
  const shownState = state !== "enabled" ? state : offset === 0 ? (visualState ?? "enabled") : "enabled";
  const action = offset > 0 ? "archive" : offset < 0 ? "delete" : null;

  return (
    <div className={styles.swipeContainer}>
      {action && <SwipeAction action={action} />}
      <div
        className={styles.swipedRow}
        data-interactive={interactive}
        data-dragging={dragging}
        style={offset ? { transform: `translateX(${offset}px)` } : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...handlers}
      >
        <RowBody {...props} state={shownState} />
      </div>
    </div>
  );
}

function RowBody({
  state = "enabled",
  status = "read",
  starred = false,
  selected = false,
  content = "default",
  avatar = "letter",
  sender,
  subject,
  snippet,
  avatarLetter = sender,
  avatarColor = "green",
  time,
  attachmentName = "sora-sagano-8s9…",
  moreFiles = "+1",
  messageCount = "2",
  label = "Inbox",
  trackingText = "Expected by Tue, Jan 14",
  onToggleStar,
}: EmailRowProps) {
  const unread = status === "unread";
  const timeType = content === "snoozed" ? "snoozed" : content === "scheduled" ? "scheduled" : "time";

  return (
    <div className={styles.row} data-status={status} data-selected={selected}>
      {state !== "enabled" && <StateLayer state={state} />}

      <Avatar type={avatar} letter={avatarLetter} color={avatarColor} />

      <div className={styles.content}>
        <div className={styles.senderLine}>
          {content === "draft" ? (
            <span className={`${styles.draft} text-body-large`}>Draft</span>
          ) : (
            <span
              className={`${styles.sender} ${unread ? "text-body-large-emphasized" : "text-body-large"}`}
              data-hug={content === "message-count"}
            >
              {sender}
            </span>
          )}
          {content === "message-count" && (
            <span className={`${styles.secondary} text-body-medium`}>{messageCount}</span>
          )}
        </div>

        <div className={styles.line}>
          {content === "important" && <Icon name="label_important" size={16} className={styles.important} />}
          <span className={`${styles.subject} ${unread ? "text-body-medium-emphasized" : "text-body-medium"}`}>
            {subject}
          </span>
        </div>

        {content === "tracking" ? (
          <div className={styles.line}>
            <Icon name="local_shipping" size={18} className={styles.delivery} />
            <span className={`${styles.snippet} text-body-medium`}>{trackingText}</span>
          </div>
        ) : (
          <div className={styles.line}>
            <span className={`${styles.snippet} text-body-medium`}>{snippet}</span>
            {content === "label-chip" && <LabelChip label={label} />}
          </div>
        )}

        {content === "attachment" && (
          <div className={styles.attachments}>
            <AttachmentChip name={attachmentName} />
            <span className={`${styles.secondary} text-body-medium`}>{moreFiles}</span>
          </div>
        )}
      </div>

      <div className={styles.trailing}>
        <TimeStamp time={time} type={timeType} emphasized={unread} onSelected={selected} />
        <StarButton starred={starred} onSelected={selected} onToggle={onToggleStar} />
      </div>

      {state === "focused" && <FocusRing />}
    </div>
  );
}
