"use client";

import NextDynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { CharacterClass } from "@/game/data/classes";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GameCanvas = NextDynamic(() => import("@/components/GameCanvas"), { ssr: false });

export default function GamePage() {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setSupabaseReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCharacterCreate = useCallback(
    async (name: string, cls: CharacterClass) => {
      if (!user) return;
      const { getBaseStats } = await import("@/game/data/classes");
      const stats = getBaseStats(cls);

      await supabase.from("characters").insert({
        user_id: user.id,
        name,
        class: cls,
        health: stats.health,
        max_health: stats.health,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
      });
    },
    [user, supabase]
  );

  const handleFetchLeaderboard = useCallback(
    (cb: (entries: unknown[]) => void) => {
      supabase
        .from("leaderboard")
        .select("*")
        .limit(20)
        .then(({ data }) => {
          cb(data || []);
        });
    },
    [supabase]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid #2a1a3a",
          flexShrink: 0,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#c9a227", fontSize: "20px", fontWeight: "bold" }}>STARLITX</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user ? (
            <>
              <span style={{ color: "#7f8c8d", fontSize: "13px" }}>
                {user.user_metadata?.username || user.email?.split("@")[0]}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                style={{
                  background: "transparent",
                  border: "1px solid #2a1a3a",
                  color: "#7f8c8d",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "Georgia, serif",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "transparent",
                  border: "1px solid #c9a227",
                  color: "#c9a227",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "Georgia, serif",
                }}
              >
                Sign In to Save Progress
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Game */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {supabaseReady && (
          <GameCanvas
            onCharacterCreate={user ? handleCharacterCreate : undefined}
            onFetchLeaderboard={handleFetchLeaderboard}
          />
        )}

        {!user && (
          <p style={{ marginTop: "16px", color: "#5d6d7e", fontSize: "12px", textAlign: "center" }}>
            Playing as guest — progress won&apos;t be saved.{" "}
            <Link href="/auth" style={{ color: "#9b59b6" }}>
              Sign in
            </Link>{" "}
            to save your warrior.
          </p>
        )}
      </div>
    </main>
  );
}
