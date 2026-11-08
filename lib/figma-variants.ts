// Maps the 23 Figma "Email row" variants (data/figma-variants.json) to EmailRow props,
// including the text and avatar overrides each variant uses in Figma.
import manifest from "@/data/figma-variants.json";
import type { EmailRowContent, EmailRowProps } from "@/components/EmailRow";

type FigmaProps = (typeof manifest)[number]["props"];

export type FigmaVariant = {
  nodeId: string;
  slug: string;
  label: string;
  props: EmailRowProps;
};

const kebab = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export const FIGMA_DEFAULTS = {
  sender: "Square",
  subject: "Your Square account has been deactivated",
  snippet: "Your Square account has been deactivated. If you believe this is a mistake…",
};

// Overrides read from each variant in Figma (avatar letter + colour, time text)
function overrides(p: FigmaProps): Partial<EmailRowProps> {
  const unread = p.Status === "Unread";
  switch (p.Content) {
    case "Attachment":
      return { time: "6:11 PM" };
    case "Draft":
      return { avatarLetter: "A", avatarColor: "orange", time: "12:36 AM" };
    case "Message count":
      return { avatarLetter: "G", avatarColor: "orange", time: "Jan 10" };
    case "Tracking":
      return { time: "1:23 PM" };
    case "Important":
      return { avatarColor: "orange" };
    case "Snoozed":
      return { time: "Tue, 8:00 AM" };
    case "Scheduled":
      return { time: "Mon, 9:00 AM" };
    case "Long text":
      return { avatarLetter: "M", avatarColor: "orange", time: "Jan 11" };
    default:
      return { time: unread ? "6:11 PM" : "5:43 PM" };
  }
}

export function toRowProps(p: FigmaProps): EmailRowProps {
  return {
    ...FIGMA_DEFAULTS,
    state: kebab(p.State) as EmailRowProps["state"],
    status: kebab(p.Status) as EmailRowProps["status"],
    starred: p.Starred === "True",
    selected: p.Selected === "True",
    content: kebab(p.Content) as EmailRowContent,
    avatar: kebab(p.Avatar) as EmailRowProps["avatar"],
    swipe: kebab(p.Swipe) as EmailRowProps["swipe"],
    avatarLetter: "S",
    avatarColor: "green",
    time: "5:43 PM",
    ...overrides(p),
  };
}

export const FIGMA_VARIANTS: FigmaVariant[] = manifest.map((v) => {
  const changed = Object.entries(v.props)
    .filter(([key, value]) => !(key === "State" && value === "Enabled") && !(key === "Status" && value === "Read") && value !== "False" && value !== "None" && value !== "Default" && !(key === "Avatar" && value === "Letter"))
    .map(([key, value]) => (value === "True" ? key : value));
  return {
    nodeId: v.nodeId,
    slug: v.slug,
    label: changed.length ? changed.join(" · ") : "Default",
    props: toRowProps(v.props),
  };
});

// The variant keys that decide which Figma variant (if any) the current props match.
const VARIANT_KEYS = ["state", "status", "starred", "selected", "content", "avatar", "swipe"] as const;

export function matchVariant(props: EmailRowProps): FigmaVariant | undefined {
  return FIGMA_VARIANTS.find((v) => VARIANT_KEYS.every((key) => (v.props[key] ?? undefined) === (props[key] ?? undefined)));
}
