import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarlitX — Solomon's Abyss | Dark Fantasy Browser RPG",
  description: "Battle all 72 demons of the Ars Goetia in this free dark fantasy RPG. Choose from 4 classes, descend through Solomon's Abyss, and claim the live leaderboard. No download required.",
  keywords: ["RPG", "dark fantasy", "browser game", "Solomon's Abyss", "StarlitX", "Ars Goetia", "demons", "free to play"],
  openGraph: {
    title: "StarlitX — Solomon's Abyss",
    description: "72 Demons. 4 Classes. One Abyss. Free dark fantasy RPG — play in your browser.",
    type: "website",
    url: "https://starlitx.vercel.app",
    siteName: "StarlitX",
  },
  twitter: {
    card: "summary_large_image",
    title: "StarlitX — Solomon's Abyss",
    description: "72 Demons. 4 Classes. One Abyss. Free dark fantasy browser RPG.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
