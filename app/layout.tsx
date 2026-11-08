import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./tokens.css";
import "./globals.css";

// Figma uses Roboto (variable font covers Regular 400, Medium 500, SemiBold 600).
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Email row playground",
  description: "Gmail mobile email row, built from the Figma design tokens",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}
