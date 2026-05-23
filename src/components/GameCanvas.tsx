"use client";

import { useEffect, useRef } from "react";
import type { CharacterClass } from "@/game/data/classes";

interface GameCanvasProps {
  onCharacterCreate?: (name: string, cls: CharacterClass, userId?: string) => Promise<void>;
  onFetchLeaderboard?: (cb: (entries: unknown[]) => void) => void;
}

export default function GameCanvas({ onCharacterCreate, onFetchLeaderboard }: GameCanvasProps) {
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

      // Wire up Supabase events
      game.events.on("characterCreate", async (name: string, cls: CharacterClass, userId?: string) => {
        if (onCharacterCreate) {
          await onCharacterCreate(name, cls, userId);
        }
      });

      game.events.on("fetchLeaderboard", (cb: (entries: unknown[]) => void) => {
        if (onFetchLeaderboard) {
          onFetchLeaderboard(cb);
        } else {
          cb([]);
        }
      });
    })();

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onCharacterCreate, onFetchLeaderboard]);

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
