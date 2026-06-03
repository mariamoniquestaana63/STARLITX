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
    padding: "12px 16px",
    background: "#12121a",
    border: "1px solid #2a1a3a",
    borderRadius: "4px",
    color: "#ecf0f1",
    fontSize: "15px",
    fontFamily: "Georgia, serif",
    outline: "none",
  };

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
      <Link href="/" style={{ textDecoration: "none" }}>
        <h1 style={{ color: "#c9a227", fontSize: "36px", fontWeight: "bold", marginBottom: "8px", textAlign: "center" }}>
          STARLITX
        </h1>
      </Link>
      <p style={{ color: "#7f8c8d", fontSize: "13px", marginBottom: "40px", fontStyle: "italic" }}>
        Solomon&apos;s Abyss
      </p>

      <div
        style={{
          background: "#12121a",
          border: "1px solid #2a1a3a",
          borderRadius: "6px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Tab switcher */}
        <div style={{ display: "flex", marginBottom: "28px", borderBottom: "1px solid #2a1a3a" }}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              style={{
                flex: 1,
                padding: "10px",
                background: "transparent",
                border: "none",
                borderBottom: mode === m ? "2px solid #c9a227" : "2px solid transparent",
                color: mode === m ? "#c9a227" : "#7f8c8d",
                fontSize: "15px",
                fontFamily: "Georgia, serif",
                cursor: "pointer",
                textTransform: "capitalize",
                marginBottom: "-1px",
              }}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", color: "#7f8c8d", fontSize: "12px", marginBottom: "6px" }}>
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
            <label style={{ display: "block", color: "#7f8c8d", fontSize: "12px", marginBottom: "6px" }}>
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
            <label style={{ display: "block", color: "#7f8c8d", fontSize: "12px", marginBottom: "6px" }}>
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
            <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center" }}>{error}</p>
          )}
          {success && (
            <p style={{ color: "#27ae60", fontSize: "13px", textAlign: "center" }}>{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px",
              background: loading ? "#1a1a2e" : "#1a0a2e",
              border: "2px solid #c9a227",
              borderRadius: "4px",
              color: "#c9a227",
              fontSize: "16px",
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "..." : mode === "login" ? "Enter the Abyss" : "Create Warrior"}
          </button>
        </form>

        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#5d6d7e" }}>
          You can also{" "}
          <Link href="/game" style={{ color: "#9b59b6", textDecoration: "none" }}>
            play as a guest
          </Link>{" "}
          without an account.
        </p>
      </div>
    </main>
  );
}
