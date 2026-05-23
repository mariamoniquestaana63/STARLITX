import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarlitX — Solomon's Abyss",
  description:
    "Dark fantasy RPG. Four classes. 72 demons of the Ars Goetia. One Abyss.",
  keywords: ["RPG", "dark fantasy", "Solomon's Abyss", "StarlitX", "Ars Goetia"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
