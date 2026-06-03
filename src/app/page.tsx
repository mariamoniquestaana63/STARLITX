"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1,
    }));

    let raf: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed * s.dir;
        if (s.alpha >= 1 || s.alpha <= 0.05) s.dir *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", fontFamily: "Georgia, serif", overflowX: "hidden", position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid #1a1a2e" }}>
        <span style={{ color: "#c9a227", fontSize: "22px", fontWeight: "bold", letterSpacing: "0.1em" }}>STARLITX</span>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/game" style={{ color: "#7f8c8d", fontSize: "14px", textDecoration: "none" }}>Play</Link>
          <Link href="/#features" style={{ color: "#7f8c8d", fontSize: "14px", textDecoration: "none" }}>Features</Link>
          <Link href="/premium" style={{ color: "#c9a227", fontSize: "14px", textDecoration: "none" }}>✦ Patron</Link>
          <Link href="/auth" style={{ padding: "8px 20px", border: "1px solid #2a1a3a", borderRadius: "4px", color: "#9b59b6", fontSize: "14px", textDecoration: "none" }}>Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ marginBottom: "16px", display: "inline-block", padding: "6px 16px", border: "1px solid #3d0a4f", borderRadius: "20px", background: "rgba(61,10,79,0.3)" }}>
          <span style={{ color: "#9b59b6", fontSize: "12px", letterSpacing: "0.15em" }}>DARK FANTASY BROWSER RPG • FREE TO PLAY</span>
        </div>
        <h1 style={{ fontSize: "clamp(56px, 12vw, 96px)", color: "#c9a227", fontWeight: "bold", letterSpacing: "0.06em", margin: "16px 0 8px", lineHeight: 1, textShadow: "0 0 60px rgba(201,162,39,0.3)" }}>
          STARLITX
        </h1>
        <p style={{ fontSize: "clamp(18px, 3vw, 26px)", color: "#9b59b6", fontStyle: "italic", margin: "0 0 12px" }}>
          Solomon&apos;s Abyss
        </p>
        <p style={{ fontSize: "16px", color: "#7f8c8d", maxWidth: "560px", margin: "0 auto 48px", lineHeight: 1.7 }}>
          Descend through 72 seals of the Ars Goetia. Confront ancient demons, grow in power, and claim your place in the Hall of Abyssal Warriors.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/game">
            <button style={btnPrimary}>ENTER THE ABYSS</button>
          </Link>
          <Link href="/auth">
            <button style={btnSecondary}>Create Account</button>
          </Link>
        </div>
        <p style={{ marginTop: "20px", fontSize: "12px", color: "#3d3d4f" }}>
          No download required · Runs in your browser · Free forever
        </p>
      </section>

      {/* Stats bar */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid #1a1a2e", borderBottom: "1px solid #1a1a2e", background: "rgba(13,13,24,0.6)", padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 80px)", flexWrap: "wrap" }}>
          {[
            { n: "72", label: "Ars Goetia Demons" },
            { n: "4", label: "Unique Classes" },
            { n: "∞", label: "Progression Depth" },
            { n: "Live", label: "Global Leaderboard" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", color: "#c9a227", fontWeight: "bold" }}>{s.n}</div>
              <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Classes */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#c9a227", fontSize: "28px", marginBottom: "8px" }}>Choose Your Class</h2>
        <p style={{ textAlign: "center", color: "#7f8c8d", fontSize: "14px", marginBottom: "48px", fontStyle: "italic" }}>
          Each path through the Abyss demands a different soul.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {CLASSES.map((c) => (
            <div key={c.name} style={{ background: "#12121a", border: `1px solid ${c.borderColor}`, borderRadius: "6px", padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{c.icon}</div>
              <h3 style={{ color: c.color, fontSize: "16px", marginBottom: "6px", fontWeight: "bold" }}>{c.name}</h3>
              <p style={{ color: "#7f8c8d", fontSize: "12px", lineHeight: "1.6", marginBottom: "16px" }}>{c.desc}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                {c.tags.map((t) => (
                  <span key={t} style={{ fontSize: "10px", padding: "3px 8px", border: `1px solid ${c.borderColor}`, borderRadius: "3px", color: c.color }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demon roster */}
      <section style={{ position: "relative", zIndex: 1, background: "rgba(13,13,24,0.8)", borderTop: "1px solid #1a1a2e", borderBottom: "1px solid #1a1a2e", padding: "72px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#c9a227", fontSize: "28px", marginBottom: "12px" }}>72 Seals Await</h2>
            <p style={{ color: "#7f8c8d", fontSize: "14px", lineHeight: "1.8", marginBottom: "20px" }}>
              Every demon of the Lesser Key of Solomon stands between you and the depths. From the first seal of Bael to the final seal of Andromalius — each has its own power, weakness, and lore drawn from the ancient grimoire.
            </p>
            <p style={{ color: "#5d6d7e", fontSize: "12px", lineHeight: "1.7", fontStyle: "italic" }}>
              Paimon commands great armies. Astaroth reveals hidden truths. Beleth rides a pale horse... Can you bind them all?
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
            {DEMON_PREVIEW.map((d) => (
              <div key={d.n} title={d.name} style={{ aspectRatio: "1", borderRadius: "50%", background: d.color, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: "bold" }}>
                {d.n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#c9a227", fontSize: "28px", marginBottom: "48px" }}>Built for Warriors</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: "flex", gap: "16px", padding: "24px", background: "#12121a", border: "1px solid #1a1a2e", borderRadius: "6px" }}>
              <div style={{ fontSize: "28px", flexShrink: 0 }}>{f.icon}</div>
              <div>
                <h3 style={{ color: "#ecf0f1", fontSize: "14px", marginBottom: "6px", fontWeight: "bold" }}>{f.title}</h3>
                <p style={{ color: "#7f8c8d", fontSize: "12px", lineHeight: "1.6" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 24px", textAlign: "center", background: "linear-gradient(180deg, transparent, rgba(61,10,79,0.15), transparent)" }}>
        <div style={{ display: "inline-block", padding: "6px 16px", border: "1px solid #c9a227", borderRadius: "20px", background: "rgba(201,162,39,0.08)", marginBottom: "20px" }}>
          <span style={{ color: "#c9a227", fontSize: "12px", letterSpacing: "0.12em" }}>✦ ABYSSAL PATRON</span>
        </div>
        <h2 style={{ color: "#c9a227", fontSize: "28px", marginBottom: "12px" }}>Support the Abyss</h2>
        <p style={{ color: "#7f8c8d", fontSize: "15px", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.7 }}>
          One-time pledge of <strong style={{ color: "#c9a227" }}>$9.99</strong> unlocks a golden name on the leaderboard, bonus starting gold, and eternal patron status.
        </p>
        <Link href="/premium">
          <button style={{ ...btnPrimary, background: "rgba(201,162,39,0.12)", border: "2px solid #c9a227" }}>
            View Patron Perks →
          </button>
        </Link>
      </section>

      {/* Final CTA */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "72px 24px" }}>
        <h2 style={{ color: "#ecf0f1", fontSize: "28px", marginBottom: "12px" }}>Ready to Descend?</h2>
        <p style={{ color: "#7f8c8d", fontSize: "14px", marginBottom: "36px" }}>No installation. No waiting. The seals are open.</p>
        <Link href="/game">
          <button style={btnPrimary}>PLAY NOW — FREE</button>
        </Link>
      </section>

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid #1a1a2e", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ color: "#c9a227", fontWeight: "bold", fontSize: "16px" }}>STARLITX</span>
          <span style={{ color: "#3d3d4f", fontSize: "12px", marginLeft: "12px" }}>Solomon&apos;s Abyss v1.0</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/game" style={{ color: "#5d6d7e", fontSize: "12px", textDecoration: "none" }}>Play</Link>
          <Link href="/premium" style={{ color: "#5d6d7e", fontSize: "12px", textDecoration: "none" }}>Patron</Link>
          <Link href="/auth" style={{ color: "#5d6d7e", fontSize: "12px", textDecoration: "none" }}>Sign In</Link>
        </div>
      </footer>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "14px 36px",
  background: "#1a0a2e",
  border: "2px solid #c9a227",
  borderRadius: "4px",
  color: "#c9a227",
  fontSize: "16px",
  fontFamily: "Georgia, serif",
  fontWeight: "bold",
  cursor: "pointer",
  letterSpacing: "0.05em",
};

const btnSecondary: React.CSSProperties = {
  padding: "14px 36px",
  background: "transparent",
  border: "1px solid #2a1a3a",
  borderRadius: "4px",
  color: "#9b59b6",
  fontSize: "15px",
  fontFamily: "Georgia, serif",
  cursor: "pointer",
};

const CLASSES = [
  { name: "Warrior", icon: "⚔", color: "#e67e22", borderColor: "#3d1a0a", tags: ["Tank", "Melee", "Survivor"], desc: "Unyielding iron will. High HP and defense, cleaves through demonic ranks." },
  { name: "Mage", icon: "✦", color: "#9b59b6", borderColor: "#2d0a3d", tags: ["Glass Cannon", "AoE", "MP-hungry"], desc: "Forbidden arts wielded against the Goetia. Devastating power at mortal cost." },
  { name: "Rogue", icon: "◈", color: "#27ae60", borderColor: "#0a2d1a", tags: ["Speed", "Crit", "Evasion"], desc: "Moves through shadow. Highest speed and critical strike chance of all classes." },
  { name: "Cleric", icon: "✚", color: "#f1c40f", borderColor: "#2d2a0a", tags: ["Healer", "Support", "Balance"], desc: "Sealed with holy bindings. Can restore HP mid-battle and sustain longer fights." },
];

const FEATURES = [
  { icon: "🔊", title: "Procedural Audio", desc: "Atmospheric dark drone + battle SFX generated in real time by the Web Audio API. No downloads, no silence." },
  { icon: "🛒", title: "Abyssal Merchant", desc: "An eldritch merchant waits between floors. Spend your spoils on consumables and permanent stat upgrades." },
  { icon: "⚡", title: "Demon Special Attacks", desc: "Each of the 72 demons has an elemental type — fire, shadow, lightning, void and more — with unique visual effects." },
  { icon: "🌐", title: "Live Leaderboard", desc: "Real-time global rankings powered by Supabase Realtime. See who has conquered the deepest floors." },
  { icon: "💾", title: "Cloud Save", desc: "Create a free account and your warrior's progress, inventory, and stats are saved across all your devices." },
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
