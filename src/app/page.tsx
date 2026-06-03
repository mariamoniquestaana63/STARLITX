"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{
            fontSize: "clamp(48px, 10vw, 80px)",
            color: "#c9a227",
            fontWeight: "bold",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}
        >
          STARLITX
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "#9b59b6",
            fontStyle: "italic",
            marginBottom: "4px",
          }}
        >
          Solomon&apos;s Abyss
        </p>
        <p style={{ fontSize: "14px", color: "#7f8c8d" }}>
          72 Demons. 4 Classes. One Abyss.
        </p>
      </div>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/game">
          <button
            style={{
              padding: "14px 40px",
              background: "#1a0a2e",
              border: "2px solid #c9a227",
              borderRadius: "4px",
              color: "#c9a227",
              fontSize: "18px",
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = "#2d1050";
              (e.target as HTMLButtonElement).style.color = "#ffffff";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = "#1a0a2e";
              (e.target as HTMLButtonElement).style.color = "#c9a227";
            }}
          >
            PLAY NOW
          </button>
        </Link>
        <Link href="/auth">
          <button
            style={{
              padding: "14px 40px",
              background: "transparent",
              border: "1px solid #2a1a3a",
              borderRadius: "4px",
              color: "#7f8c8d",
              fontSize: "16px",
              fontFamily: "Georgia, serif",
              cursor: "pointer",
            }}
          >
            Sign In / Register
          </button>
        </Link>
      </div>

      {/* Feature grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "64px",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {[
          { icon: "⚔", title: "4 Unique Classes", desc: "Warrior, Mage, Rogue, Cleric — each with distinct playstyles and abilities." },
          { icon: "👁", title: "72 Ars Goetia Demons", desc: "Battle every demon from Solomon's sacred seals — from Bael to Andromalius." },
          { icon: "★", title: "Endless Progression", desc: "Level up, gain gold, and grow stronger as you descend deeper." },
          { icon: "◈", title: "Dark Fantasy World", desc: "A world steeped in occult lore, ancient seals, and demonic hierarchy." },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: "#12121a",
              border: "1px solid #2a1a3a",
              borderRadius: "6px",
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.icon}</div>
            <h3 style={{ color: "#c9a227", fontSize: "15px", marginBottom: "8px" }}>{f.title}</h3>
            <p style={{ color: "#7f8c8d", fontSize: "13px", lineHeight: "1.6" }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "64px", color: "#3d3d4f", fontSize: "12px" }}>
        StarlitX — Solomon&apos;s Abyss v0.1.0 Alpha
      </footer>
    </main>
  );
}
