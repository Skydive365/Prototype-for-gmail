import type { Metadata } from "next";
import { Inbox } from "./Inbox";

export const metadata: Metadata = {
  title: "Inbox prototype",
  description: "Gmail mobile inbox built from the Figma design tokens and components",
};

export default function InboxPage() {
  return <Inbox />;
}
