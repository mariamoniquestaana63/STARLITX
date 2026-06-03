"use client";

export const dynamic = "force-dynamic";

import NextDynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { CharacterClass } from "@/game/data/classes";
import type { PlayerState } from "@/game/scenes/BattleScene";
import Link from "next/link";

const GameCanvas = NextDynamic(() => import("@/components/GameCanvas"), { ssr: false });

export default function GamePage() {
  const [user, setUser] = useState<User | null>(null);
  const [savedCharacter, setSavedCharacter] = useState<PlayerState | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        // Load most recent active character
        const { data: chars } = await supabase
          .from("characters")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("is_active", true)
          .order("last_saved", { ascending: false })
          .limit(1);

        if (chars && chars.length > 0) {
          const c = chars[0];
          setSavedCharacter({
            name: c.name,
            class: c.class as CharacterClass,
            level: c.level,
            experience: c.experience,
            health: c.health,
            maxHealth: c.max_health,
            mp: 60,
            maxMp: 60,
            attack: c.attack,
            defense: c.defense,
            speed: c.speed,
            floor: c.current_floor,
            gold: c.gold,
            inventory: c.inventory ?? [],
            skillCooldowns: [0, 0],
            buffNextAttack: false,
            defendingThisTurn: false,
            characterId: c.id,
          });
        }
      }

      setSupabaseReady(true);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setSavedCharacter(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Called when creating a new character — inserts to Supabase and returns id
  const handleCharacterCreate = useCallback(
    async (name: string, cls: CharacterClass): Promise<string | null> => {
      if (!user) return null;
      const { getBaseStats } = await import("@/game/data/classes");
      const stats = getBaseStats(cls);

      const { data, error } = await supabase
        .from("characters")
        .insert({
          user_id: user.id,
          name,
          class: cls,
          health: stats.health,
          max_health: stats.health,
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
        })
        .select("id")
        .single();

      if (error || !data) return null;
      return data.id;
    },
    [user, supabase]
  );

  // Called after each victory — upserts character state
  const handleSaveCharacter = useCallback(
    async (state: PlayerState) => {
      if (!user || !state.characterId) return;

      await supabase
        .from("characters")
        .update({
          level: state.level,
          experience: state.experience,
          health: state.health,
          max_health: state.maxHealth,
          attack: state.attack,
          defense: state.defense,
          speed: state.speed,
          current_floor: state.floor,
          gold: state.gold,
          inventory: state.inventory,
          last_saved: new Date().toISOString(),
        })
        .eq("id", state.characterId);
    },
    [user, supabase]
  );

  const handleFetchLeaderboard = useCallback(
    (cb: (entries: unknown[]) => void) => {
      supabase.from("leaderboard").select("*").limit(20).then(({ data }) => cb(data || []));
    },
    [supabase]
  );

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #2a1a3a", flexShrink: 0 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#c9a227", fontSize: "20px", fontWeight: "bold" }}>STARLITX</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user ? (
            <>
              <span style={{ color: "#7f8c8d", fontSize: "13px" }}>
                {user.user_metadata?.username || user.email?.split("@")[0]}
                {savedCharacter && (
                  <span style={{ color: "#6c3483", marginLeft: "8px" }}>
                    • {savedCharacter.name} Lv.{savedCharacter.level}
                  </span>
                )}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                style={{ background: "transparent", border: "1px solid #2a1a3a", color: "#7f8c8d", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontFamily: "Georgia, serif" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", border: "1px solid #c9a227", color: "#c9a227", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontFamily: "Georgia, serif" }}>
                Sign In to Save Progress
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Game */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {supabaseReady && (
          <GameCanvas
            savedCharacter={savedCharacter}
            onCharacterCreate={user ? handleCharacterCreate : undefined}
            onSaveCharacter={user ? handleSaveCharacter : undefined}
            onFetchLeaderboard={handleFetchLeaderboard}
          />
        )}

        {!user && (
          <p style={{ marginTop: "16px", color: "#5d6d7e", fontSize: "12px", textAlign: "center" }}>
            Playing as guest — progress won&apos;t be saved.{" "}
            <Link href="/auth" style={{ color: "#9b59b6" }}>Sign in</Link>{" "}
            to save your warrior.
          </p>
        )}
      </div>
    </main>
  );
}
