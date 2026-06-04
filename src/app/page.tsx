"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#111", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f0f0f0" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ color: "#f0f0f0", fontSize: "18px", fontWeight: "700", letterSpacing: "0.05em" }}>STARLITX</span>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/game" style={{ color: "#888", fontSize: "14px", textDecoration: "none" }}>Play</Link>
          <Link href="/#features" style={{ color: "#888", fontSize: "14px", textDecoration: "none" }}>Features</Link>
          <Link href="/premium" style={{ color: "#a78bfa", fontSize: "14px", textDecoration: "none" }}>Patron</Link>
          <Link href="/auth" style={{ padding: "7px 18px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#f0f0f0", fontSize: "14px", textDecoration: "none" }}>Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "96px 24px 72px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", background: "rgba(167,139,250,0.12)", borderRadius: "20px", marginBottom: "24px" }}>
          <span style={{ color: "#a78bfa", fontSize: "12px", letterSpacing: "0.1em" }}>DARK FANTASY BROWSER RPG · FREE TO PLAY</span>
        </div>
        <h1 style={{ fontSize: "clamp(48px, 10vw, 80px)", color: "#f0f0f0", fontWeight: "800", letterSpacing: "0.04em", margin: "0 0 12px", lineHeight: 1.1 }}>
          Solomon&apos;s Abyss
        </h1>
        <p style={{ fontSize: "16px", color: "#888", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.7 }}>
          Descend through 72 seals of the Ars Goetia. Fight ancient demons, grow in power, and claim your place on the global leaderboard.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/game">
            <button style={btnPrimary}>Play Now</button>
          </Link>
          <Link href="/auth">
            <button style={btnSecondary}>Create Account</button>
          </Link>
        </div>
        <p style={{ marginTop: "16px", fontSize: "12px", color: "#555" }}>
          No download · Runs in browser · Free forever
        </p>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#1a1a1a", padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 8vw, 80px)", flexWrap: "wrap" }}>
          {[
            { n: "72", label: "Ars Goetia Demons" },
            { n: "4", label: "Unique Classes" },
            { n: "∞", label: "Progression Depth" },
            { n: "Live", label: "Global Leaderboard" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", color: "#a78bfa", fontWeight: "700" }}>{s.n}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Classes */}
      <section id="features" style={{ padding: "72px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#f0f0f0", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Choose Your Class</h2>
        <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginBottom: "40px" }}>
          Each path through the Abyss demands a different soul.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {CLASSES.map((c) => (
            <div key={c.name} style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{c.icon}</div>
              <h3 style={{ color: c.color, fontSize: "15px", marginBottom: "6px", fontWeight: "600" }}>{c.name}</h3>
              <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.6", marginBottom: "14px" }}>{c.desc}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                {c.tags.map((t) => (
                  <span key={t} style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(167,139,250,0.1)", borderRadius: "4px", color: "#a78bfa" }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demons section */}
      <section style={{ background: "#1a1a1a", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "64px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#f0f0f0", fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>72 Seals Await</h2>
            <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.8", marginBottom: "16px" }}>
              Every demon of the Lesser Key of Solomon stands between you and the depths. From Bael to Andromalius — each has its own power, weakness, and lore drawn from the ancient grimoire.
            </p>
            <p style={{ color: "#555", fontSize: "12px", lineHeight: "1.7" }}>
              Paimon commands great armies. Astaroth reveals hidden truths. Beleth rides a pale horse... Can you bind them all?
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
            {DEMON_PREVIEW.map((d) => (
              <div key={d.n} title={d.name} style={{ aspectRatio: "1", borderRadius: "50%", background: d.color, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: "700" }}>
                {d.n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "72px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#f0f0f0", fontSize: "24px", fontWeight: "700", marginBottom: "40px" }}>Built for Warriors</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: "flex", gap: "16px", padding: "20px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", flexShrink: 0 }}>{f.icon}</div>
              <div>
                <h3 style={{ color: "#f0f0f0", fontSize: "14px", marginBottom: "6px", fontWeight: "600" }}>{f.title}</h3>
                <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.6" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Patron CTA */}
      <section style={{ padding: "64px 24px", textAlign: "center", background: "#1a1a1a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", background: "rgba(167,139,250,0.12)", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ color: "#a78bfa", fontSize: "12px", letterSpacing: "0.1em" }}>ABYSSAL PATRON</span>
        </div>
        <h2 style={{ color: "#f0f0f0", fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>Support the Abyss</h2>
        <p style={{ color: "#888", fontSize: "15px", maxWidth: "440px", margin: "0 auto 28px", lineHeight: 1.7 }}>
          One-time <strong style={{ color: "#f0f0f0" }}>$9.99</strong> — golden leaderboard name, bonus gold, eternal patron status.
        </p>
        <Link href="/premium">
          <button style={btnPrimary}>View Patron Perks</button>
        </Link>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: "center", padding: "64px 24px" }}>
        <h2 style={{ color: "#f0f0f0", fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>Ready to Descend?</h2>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>No installation. No waiting. The seals are open.</p>
        <Link href="/game">
          <button style={btnPrimary}>Play Now — Free</button>
        </Link>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ color: "#f0f0f0", fontWeight: "700", fontSize: "15px" }}>STARLITX</span>
          <span style={{ color: "#555", fontSize: "12px", marginLeft: "12px" }}>Solomon&apos;s Abyss v1.0</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/game" style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}>Play</Link>
          <Link href="/premium" style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}>Patron</Link>
          <Link href="/auth" style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}>Sign In</Link>
        </div>
      </footer>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "12px 28px",
  background: "#a78bfa",
  border: "none",
  borderRadius: "6px",
  color: "#111",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 28px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "6px",
  color: "#f0f0f0",
  fontSize: "15px",
  cursor: "pointer",
};

const CLASSES = [
  { name: "Warrior", icon: "⚔", color: "#fb923c", tags: ["Tank", "Melee", "Survivor"], desc: "Unyielding iron will. High HP and defense, cleaves through demonic ranks." },
  { name: "Mage", icon: "✦", color: "#a78bfa", tags: ["Glass Cannon", "AoE", "MP-hungry"], desc: "Forbidden arts wielded against the Goetia. Devastating power at mortal cost." },
  { name: "Rogue", icon: "◈", color: "#34d399", tags: ["Speed", "Crit", "Evasion"], desc: "Moves through shadow. Highest speed and critical strike chance of all classes." },
  { name: "Cleric", icon: "✚", color: "#fbbf24", tags: ["Healer", "Support", "Balance"], desc: "Sealed with holy bindings. Can restore HP mid-battle and sustain longer fights." },
];

const FEATURES = [
  { icon: "🔊", title: "Procedural Audio", desc: "Atmospheric dark drone + battle SFX generated in real time by the Web Audio API. No downloads." },
  { icon: "🛒", title: "Abyssal Merchant", desc: "An eldritch merchant waits between floors. Spend your spoils on consumables and stat upgrades." },
  { icon: "⚡", title: "Demon Special Attacks", desc: "Each of the 72 demons has an elemental type — fire, shadow, lightning, void — with unique effects." },
  { icon: "🌐", title: "Live Leaderboard", desc: "Real-time global rankings powered by Supabase Realtime. See who has conquered the deepest floors." },
  { icon: "💾", title: "Cloud Save", desc: "Create a free account and your warrior's progress, inventory, and stats are saved across devices." },
  { icon: "♾", title: "Endless Replayability", desc: "Permadeath stakes, random loot drops, and shop rotations seeded per floor keep every run fresh." },
];

const DEMON_PREVIEW = [
  { n: 1, name: "Bael", color: "#2d0a0a" }, { n: 2, name: "Agares", color: "#0a2d0a" },
  { n: 3, name: "Vassago", color: "#0a0a2d" }, { n: 4, name: "Gamigin", color: "#2d2d0a" },
  { n: 5, name: "Marbas", color: "#2d0a2d" }, { n: 6, name: "Valefor", color: "#0a2d2d" },
  { n: 7, name: "Amon", color: "#3d1a0a" }, { n: 8, name: "Barbatos", color: "#1a3d0a" },
  { n: 9, name: "Paimon", color: "#1a0a3d" }, { n: 10, name: "Buer", color: "#3d3d0a" },
  { n: 11, name: "Gusion", color: "#3d0a3d" }, { n: 12, name: "Sitri", color: "#0a3d3d" },
  { n: 13, name: "Beleth", color: "#4a1a0a" }, { n: 14, name: "Leraje", color: "#1a4a0a" },
  { n: 15, name: "Eligos", color: "#1a0a4a" }, { n: 16, name: "Zepar", color: "#4a4a0a" },
  { n: 17, name: "Botis", color: "#4a0a4a" }, { n: 18, name: "Bathin", color: "#0a4a4a" },
];
