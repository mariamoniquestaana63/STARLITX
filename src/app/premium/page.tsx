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
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", fontFamily: "Georgia, serif", color: "#ecf0f1" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid #1a1a2e" }}>
        <Link href="/" style={{ color: "#c9a227", fontSize: "20px", fontWeight: "bold", textDecoration: "none", letterSpacing: "0.1em" }}>STARLITX</Link>
        <Link href="/game" style={{ padding: "8px 20px", border: "1px solid #c9a227", borderRadius: "4px", color: "#c9a227", fontSize: "13px", textDecoration: "none" }}>Play Now</Link>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 48px" }}>
        <div style={{ display: "inline-block", padding: "6px 20px", border: "1px solid #c9a227", borderRadius: "20px", background: "rgba(201,162,39,0.08)", marginBottom: "20px" }}>
          <span style={{ color: "#c9a227", fontSize: "12px", letterSpacing: "0.15em" }}>✦ ABYSSAL PATRON</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", color: "#c9a227", marginBottom: "16px", fontWeight: "bold" }}>
          Become an Abyssal Patron
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "15px", maxWidth: "520px", margin: "0 auto", lineHeight: 1.8 }}>
          A one-time pledge to Solomon&apos;s Abyss. No subscription. No expiry. Your patronage is eternal — sealed into the ledger of the Abyss forever.
        </p>
      </section>

      {/* Pricing card */}
      <section style={{ display: "flex", justifyContent: "center", padding: "0 24px 64px" }}>
        <div style={{ width: "100%", maxWidth: "420px", background: "#12121a", border: "2px solid #c9a227", borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 60px rgba(201,162,39,0.12)" }}>
          {/* Card header */}
          <div style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.15), rgba(61,10,79,0.3))", padding: "32px 32px 24px", borderBottom: "1px solid #2a1a3a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✦</div>
            <h2 style={{ color: "#c9a227", fontSize: "22px", marginBottom: "4px" }}>Abyssal Patron</h2>
            <p style={{ color: "#7f8c8d", fontSize: "13px" }}>One-time · Permanent</p>
            <div style={{ marginTop: "20px" }}>
              <span style={{ color: "#c9a227", fontSize: "48px", fontWeight: "bold" }}>$9.99</span>
              <span style={{ color: "#7f8c8d", fontSize: "14px", marginLeft: "8px" }}>one time</span>
            </div>
          </div>

          {/* Perks */}
          <div style={{ padding: "28px 32px" }}>
            <p style={{ color: "#7f8c8d", fontSize: "12px", marginBottom: "20px", letterSpacing: "0.1em" }}>WHAT YOU UNLOCK</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {PERKS.map((p) => (
                <li key={p.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: "#c9a227", fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <div>
                    <span style={{ color: "#ecf0f1", fontSize: "14px", fontWeight: "bold" }}>{p.title}</span>
                    <span style={{ color: "#7f8c8d", fontSize: "12px", marginLeft: "8px" }}>{p.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "#1a1a2e" : "#1a0a2e", border: "2px solid #c9a227", borderRadius: "4px", color: "#c9a227", fontSize: "16px", fontFamily: "Georgia, serif", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}
            >
              {loading ? "Opening Seal..." : "Pledge Patronage — $9.99"}
            </button>

            <p style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "#3d3d4f" }}>
              Secure payment via Stripe · Instant access · No refunds on digital goods
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ color: "#c9a227", fontSize: "20px", marginBottom: "28px", textAlign: "center" }}>Common Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {FAQ.map((f) => (
            <div key={f.q} style={{ borderBottom: "1px solid #1a1a2e", paddingBottom: "20px" }}>
              <p style={{ color: "#ecf0f1", fontSize: "14px", marginBottom: "8px", fontWeight: "bold" }}>{f.q}</p>
              <p style={{ color: "#7f8c8d", fontSize: "13px", lineHeight: "1.7" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #1a1a2e", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <Link href="/" style={{ color: "#c9a227", fontWeight: "bold", fontSize: "16px", textDecoration: "none" }}>← Back to STARLITX</Link>
        <span style={{ color: "#3d3d4f", fontSize: "12px" }}>Payments secured by Stripe</span>
      </footer>
    </main>
  );
}

const PERKS = [
  { title: "Golden Leaderboard Name", desc: "— your name glows gold with ✦ on all rankings" },
  { title: "+100 Starting Gold", desc: "— every new character begins wealthier" },
  { title: "Patron Badge", desc: "— permanent ✦ next to your character names" },
  { title: "Early Access", desc: "— new content and classes unlocked first" },
  { title: "Eternal Status", desc: "— one payment, never expires, never revoked" },
];

const FAQ = [
  { q: "Is this a subscription?", a: "No. It is a single one-time payment of $9.99. You become a Patron forever with no recurring charges." },
  { q: "When do I get access?", a: "Immediately after payment. Your account is upgraded within seconds and the golden badge appears on the leaderboard right away." },
  { q: "Do I need an account?", a: "Yes — you need a free StarlitX account so we can permanently link your patron status to your profile." },
  { q: "What if I don't have an account yet?", a: "Create one free at starlitx.vercel.app/auth, then come back here to become a Patron." },
  { q: "Can I get a refund?", a: "Due to the digital and permanent nature of this product, all sales are final. If something goes wrong technically, contact us and we will resolve it." },
];
