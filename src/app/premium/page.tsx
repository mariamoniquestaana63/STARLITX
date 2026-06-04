"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id ?? null }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Checkout failed");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: unknown) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#111", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f0f0f0" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ color: "#f0f0f0", fontSize: "18px", fontWeight: "700", textDecoration: "none", letterSpacing: "0.04em" }}>STARLITX</Link>
        <Link href="/game" style={{ padding: "7px 18px", background: "#a78bfa", borderRadius: "6px", color: "#111", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>Play Now</Link>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "64px 24px 40px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", background: "rgba(167,139,250,0.12)", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ color: "#a78bfa", fontSize: "12px", letterSpacing: "0.1em" }}>ABYSSAL PATRON</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#f0f0f0", marginBottom: "14px", fontWeight: "800" }}>
          Become a Patron
        </h1>
        <p style={{ color: "#888", fontSize: "15px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
          A one-time pledge to Solomon&apos;s Abyss. No subscription. No expiry. Your patronage is sealed into the ledger forever.
        </p>
      </section>

      {/* Pricing card */}
      <section style={{ display: "flex", justifyContent: "center", padding: "0 24px 56px" }}>
        <div style={{ width: "100%", maxWidth: "400px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden" }}>
          {/* Card header */}
          <div style={{ background: "rgba(167,139,250,0.08)", padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>✦</div>
            <h2 style={{ color: "#f0f0f0", fontSize: "20px", marginBottom: "4px", fontWeight: "700" }}>Abyssal Patron</h2>
            <p style={{ color: "#888", fontSize: "13px" }}>One-time · Permanent</p>
            <div style={{ marginTop: "16px" }}>
              <span style={{ color: "#a78bfa", fontSize: "44px", fontWeight: "800" }}>$9.99</span>
              <span style={{ color: "#888", fontSize: "14px", marginLeft: "8px" }}>one time</span>
            </div>
          </div>

          {/* Perks */}
          <div style={{ padding: "24px 28px" }}>
            <p style={{ color: "#555", fontSize: "11px", marginBottom: "16px", letterSpacing: "0.08em", textTransform: "uppercase" }}>What you unlock</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {PERKS.map((p) => (
                <li key={p.title} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#a78bfa", fontSize: "14px", flexShrink: 0, marginTop: "2px" }}>✓</span>
                  <div>
                    <span style={{ color: "#f0f0f0", fontSize: "14px", fontWeight: "600" }}>{p.title}</span>
                    <span style={{ color: "#888", fontSize: "12px", marginLeft: "6px" }}>{p.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "14px", textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: "100%", padding: "13px", background: loading ? "#333" : "#a78bfa", border: "none", borderRadius: "8px", color: loading ? "#888" : "#111", fontSize: "15px", fontFamily: "system-ui, sans-serif", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Opening..." : "Pledge Patronage — $9.99"}
            </button>

            <p style={{ marginTop: "14px", textAlign: "center", fontSize: "11px", color: "#555" }}>
              Secure payment via Stripe · Instant access · No refunds on digital goods
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={{ color: "#f0f0f0", fontSize: "20px", fontWeight: "700", marginBottom: "24px", textAlign: "center" }}>Common Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {FAQ.map((f) => (
            <div key={f.q} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px" }}>
              <p style={{ color: "#f0f0f0", fontSize: "14px", marginBottom: "8px", fontWeight: "600" }}>{f.q}</p>
              <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.7" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <Link href="/" style={{ color: "#f0f0f0", fontWeight: "700", fontSize: "15px", textDecoration: "none" }}>← STARLITX</Link>
        <span style={{ color: "#555", fontSize: "12px" }}>Payments secured by Stripe</span>
      </footer>
    </main>
  );
}

const PERKS = [
  { title: "Golden Leaderboard Name", desc: "— your name glows on all rankings" },
  { title: "+100 Starting Gold", desc: "— every new character begins wealthier" },
  { title: "Patron Badge", desc: "— permanent ✦ next to your character names" },
  { title: "Early Access", desc: "— new content and classes unlocked first" },
  { title: "Eternal Status", desc: "— one payment, never expires, never revoked" },
];

const FAQ = [
  { q: "Is this a subscription?", a: "No. It is a single one-time payment of $9.99. You become a Patron forever with no recurring charges." },
  { q: "When do I get access?", a: "Immediately after payment. Your account is upgraded within seconds and the badge appears on the leaderboard right away." },
  { q: "Do I need an account?", a: "Yes — you need a free StarlitX account so we can permanently link your patron status to your profile." },
  { q: "Can I get a refund?", a: "Due to the digital and permanent nature of this product, all sales are final. If something goes wrong technically, contact us and we will resolve it." },
];
