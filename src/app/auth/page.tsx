"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (username.trim().length < 3) {
          setError("Username must be at least 3 characters.");
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
          },
        });
        if (signUpError) throw signUpError;
        setSuccess("Account created! Check your email to confirm, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/game");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    color: "#f0f0f0",
    fontSize: "15px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    outline: "none",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f0f0f0",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <h1 style={{ color: "#f0f0f0", fontSize: "28px", fontWeight: "800", marginBottom: "6px", textAlign: "center", letterSpacing: "0.04em" }}>
          STARLITX
        </h1>
      </Link>
      <p style={{ color: "#888", fontSize: "13px", marginBottom: "36px" }}>
        Solomon&apos;s Abyss
      </p>

      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          padding: "36px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Tab switcher */}
        <div style={{ display: "flex", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              style={{
                flex: 1,
                padding: "10px",
                background: "transparent",
                border: "none",
                borderBottom: mode === m ? "2px solid #a78bfa" : "2px solid transparent",
                color: mode === m ? "#a78bfa" : "#888",
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                cursor: "pointer",
                textTransform: "capitalize",
                marginBottom: "-1px",
                fontWeight: mode === m ? "600" : "400",
              }}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your warrior name"
                required
                style={inputStyle}
              />
            </div>
          )}
          <div>
            <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{error}</p>
          )}
          {success && (
            <p style={{ color: "#34d399", fontSize: "13px", textAlign: "center" }}>{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              background: loading ? "#333" : "#a78bfa",
              border: "none",
              borderRadius: "6px",
              color: loading ? "#888" : "#111",
              fontSize: "15px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#555" }}>
          Or{" "}
          <Link href="/game" style={{ color: "#a78bfa", textDecoration: "none" }}>
            play as a guest
          </Link>{" "}
          without an account.
        </p>
      </div>
    </main>
  );
}
