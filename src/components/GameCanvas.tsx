"use client";

import { useEffect, useRef } from "react";
import type { CharacterClass } from "@/game/data/classes";
import type { PlayerState } from "@/game/scenes/BattleScene";

interface GameCanvasProps {
  onCharacterCreate?: (name: string, cls: CharacterClass) => Promise<string | null>;
  onSaveCharacter?: (state: PlayerState) => Promise<void>;
  onFetchLeaderboard?: (cb: (entries: unknown[]) => void) => void;
  onSubscribeLeaderboard?: (emit: (data: unknown[]) => void) => () => void;
  savedCharacter?: PlayerState | null;
}

export default function GameCanvas({
  onCharacterCreate,
  onSaveCharacter,
  onFetchLeaderboard,
  onSubscribeLeaderboard,
  savedCharacter,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    let game: import("phaser").Game;

    (async () => {
      const Phaser = (await import("phaser")).default;
      const { createGameConfig } = await import("@/game/config");

      const config = createGameConfig(containerRef.current!);
      game = new Phaser.Game(config);
      gameRef.current = game;

      // Pass saved character into the registry so CharacterSelectScene can read it
      if (savedCharacter) {
        game.registry.set("savedCharacter", savedCharacter);
        game.registry.set("clearedFloors", Array.from(
          { length: savedCharacter.floor - 1 },
          (_, i) => i + 1
        ));
      }

      // Save character state to Supabase after each victory
      game.events.on("saveCharacter", async (state: PlayerState) => {
        if (onSaveCharacter) await onSaveCharacter(state);
      });

      // Called when player creates a new character — returns character DB id
      game.events.on("characterCreate", async (
        name: string,
        cls: CharacterClass,
        cb: (id: string | null) => void
      ) => {
        if (onCharacterCreate) {
          const id = await onCharacterCreate(name, cls);
          cb(id);
        } else {
          cb(null);
        }
      });

      // Leaderboard fetch
      game.events.on("fetchLeaderboard", (cb: (entries: unknown[]) => void) => {
        if (onFetchLeaderboard) onFetchLeaderboard(cb);
        else cb([]);
      });

      // Realtime leaderboard subscription
      let unsubscribeRealtime: (() => void) | undefined;
      if (onSubscribeLeaderboard) {
        unsubscribeRealtime = onSubscribeLeaderboard((data) => {
          game.events.emit("leaderboardUpdate", data);
        });
      }

      return () => {
        unsubscribeRealtime?.();
      };
    })();

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);   // intentionally run once — game instance owns its own state

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "800px",
        aspectRatio: "800 / 550",
        margin: "0 auto",
        position: "relative",
        backgroundColor: "#0a0a0f",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: "0 0 40px rgba(124, 58, 237, 0.2)",
      }}
    />
  );
}
