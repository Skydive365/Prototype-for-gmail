// Sample inbox for the prototype: the "Monday morning" list from Figma plus older mail to scroll through.
// All senders and content are fictional.
import type { EmailRowProps } from "@/components/EmailRow";

export type InboxEmail = Omit<EmailRowProps, "state" | "swipe" | "interactive" | "onTap" | "onLongPress" | "onSwipe" | "onToggleStar"> & {
  id: string;
  group: string;
};

export const INBOX: InboxEmail[] = [
  { id: "1", group: "Today", sender: "Priya Shah", subject: "Q4 roadmap review moved to 2 PM", snippet: "Hi team, quick heads-up: we've moved the review to this afternoon", time: "9:12 AM", status: "unread", starred: true, avatarLetter: "P", avatarColor: "orange" },
  { id: "2", group: "Today", sender: "Dropbox", subject: "Shared: Brand guidelines v3", snippet: "Maya shared 2 files with you", time: "8:47 AM", status: "unread", content: "attachment", attachmentName: "brand-guidelines-v3.pdf", moreFiles: "+1", avatarLetter: "D", avatarColor: "green" },
  { id: "3", group: "Today", sender: "Notion", subject: "Weekly team notes", snippet: "Notes from Friday's sync are ready to review", time: "8:05 AM", status: "unread", content: "label-chip", label: "Work", avatarLetter: "N", avatarColor: "orange" },
  { id: "4", group: "Yesterday", sender: "Bluefin Delivery", subject: "Your package is on its way", snippet: "Order #4821 has shipped", time: "Nov 7", content: "tracking", avatar: "no-photo", trackingText: "Expected by Tue, Nov 10" },
  { id: "5", group: "Yesterday", sender: "Leo Martinez", subject: "Re: Weekend hike photos", snippet: "Here are the best ones from Saturday", time: "Mon, 8:00 AM", content: "snoozed", avatarLetter: "L", avatarColor: "green" },
  { id: "6", group: "Yesterday", sender: "Figma", subject: "Your weekly design digest", snippet: "Five new plugins and a tip for auto layout", time: "Nov 7", starred: true, avatarLetter: "F", avatarColor: "orange" },
  { id: "7", group: "This week", sender: "Grace Okafor", subject: "Re: Dinner on Saturday?", snippet: "Sounds great! I'll book the table for 7", time: "Nov 6", content: "message-count", messageCount: "3", avatarLetter: "G", avatarColor: "green" },
  { id: "8", group: "This week", sender: "Calendar", subject: "Invitation: Design critique", snippet: "Thursday 3:00 PM – 4:00 PM, Room 4B", time: "Nov 5", content: "important", avatarLetter: "C", avatarColor: "orange" },
  { id: "9", group: "This week", sender: "Square", subject: "Payment received", snippet: "You received $42.00 from Alex Kim", time: "Nov 5", avatarLetter: "S", avatarColor: "green" },
  { id: "10", group: "This week", sender: "Draft", subject: "Re: Lunch next week", snippet: "Hey! Tuesday works for me, how about", time: "Nov 4", content: "draft", avatarLetter: "M", avatarColor: "orange" },
];
