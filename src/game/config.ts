import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { BattleScene } from "./scenes/BattleScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 550,
    backgroundColor: "#0a0a0f",
    scene: [BootScene, MainMenuScene, CharacterSelectScene, BattleScene, LeaderboardScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    dom: {
      createContainer: false,
    },
  };
}
