import Phaser from "phaser";
import { DEMONS } from "../data/demons";
import { getClass } from "../data/classes";

interface OverworldData {
  playerState: {
    name: string;
    class: string;
    level: number;
    floor: number;
    health: number;
    maxHealth: number;
    gold: number;
    experience: number;
  };
  clearedFloors: number[];
  lastDrop?: { itemName: string } | null;
}

export class OverworldScene extends Phaser.Scene {
  private sceneData!: OverworldData;

  constructor() {
    super({ key: "OverworldScene" });
  }

  init(data: OverworldData) {
    this.sceneData = data;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.7));
      this.tweens.add({ targets: star, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }

    // ── Header ───────────────────────────────────────────────────────────────
    this.add.text(width / 2, 20, "Solomon's Abyss — Seal Map", {
      fontSize: "18px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    const cls = getClass(this.sceneData.playerState.class as never);
    const hpRatio = this.sceneData.playerState.health / this.sceneData.playerState.maxHealth;
    const statColor = "#" + cls.color.toString(16).padStart(6, "0");

    this.add.text(20, 42, `${this.sceneData.playerState.name}`, { fontSize: "13px", color: statColor, fontFamily: "Georgia, serif", fontStyle: "bold" });
    this.add.text(20, 58, `Lv.${this.sceneData.playerState.level} ${cls.name}  •  Floor ${this.sceneData.playerState.floor}  •  ${this.sceneData.playerState.gold}g`, {
      fontSize: "11px", color: "#7f8c8d", fontFamily: "Georgia, serif",
    });

    // HP bar
    this.add.rectangle(20 + 80, 77, 160, 6, 0x1a1a2e);
    this.add.rectangle(20, 77, 160 * hpRatio, 6, hpRatio > 0.5 ? 0x27ae60 : hpRatio > 0.25 ? 0xe67e22 : 0xdc2626).setOrigin(0, 0.5);
    this.add.text(185, 74, `${this.sceneData.playerState.health}/${this.sceneData.playerState.maxHealth} HP`, { fontSize: "10px", color: "#5d6d7e", fontFamily: "Georgia, serif" });

    // ── Drop notification ────────────────────────────────────────────────────
    if (this.sceneData.lastDrop) {
      const dropBox = this.add.rectangle(width - 110, 55, 180, 32, 0x1a0a2e).setStrokeStyle(1, 0xc9a227);
      this.add.text(width - 110, 55, `✦ Dropped: ${this.sceneData.lastDrop.itemName}`, {
        fontSize: "11px", color: "#c9a227", fontFamily: "Georgia, serif",
      }).setOrigin(0.5);
      this.tweens.add({ targets: [dropBox], alpha: 0, delay: 3000, duration: 1000 });
    }

    // ── Legend ───────────────────────────────────────────────────────────────
    const legendY = height - 18;
    this.drawLegendDot(width - 200, legendY, 0x27ae60); this.add.text(width - 190, legendY, "Sealed", { fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif" }).setOrigin(0, 0.5);
    this.drawLegendDot(width - 130, legendY, 0xc9a227); this.add.text(width - 120, legendY, "Current", { fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif" }).setOrigin(0, 0.5);
    this.drawLegendDot(width - 55, legendY, 0x2a1a3a); this.add.text(width - 45, legendY, "Locked", { fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif" }).setOrigin(0, 0.5);

    // ── Seal Grid ────────────────────────────────────────────────────────────
    const cols = 9;
    const rows = 8;
    const gridW = width - 40;
    const gridH = height - 130;
    const cellW = Math.floor(gridW / cols);
    const cellH = Math.floor(gridH / rows);
    const gridStartX = 20;
    const gridStartY = 92;

    for (let i = 0; i < 72; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = gridStartX + col * cellW + cellW / 2;
      const cy = gridStartY + row * cellH + cellH / 2;
      const demonFloor = i + 1;
      const demon = DEMONS[i];
      const isCleared = this.sceneData.clearedFloors.includes(demonFloor);
      const isCurrent = demonFloor === this.sceneData.playerState.floor;
      const isLocked = demonFloor > this.sceneData.playerState.floor;

      this.drawSeal(cx, cy, cellW, cellH, demon, demonFloor, isCleared, isCurrent, isLocked);
    }

    // ── Continue button ──────────────────────────────────────────────────────
    const btnY = height - 38;
    const btn = this.add.rectangle(width / 2, btnY, 240, 36, 0x1a0a2e)
      .setInteractive({ cursor: "pointer" })
      .setStrokeStyle(2, 0xc9a227);
    const btnTxt = this.add.text(width / 2, btnY, `Descend to Floor ${this.sceneData.playerState.floor}`, {
      fontSize: "14px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    btn.on("pointerover", () => { btn.setFillStyle(0x2d1050); btnTxt.setColor("#ffffff"); });
    btn.on("pointerout", () => { btn.setFillStyle(0x1a0a2e); btnTxt.setColor("#c9a227"); });
    btn.on("pointerdown", () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BattleScene", { playerState: this.sceneData.playerState });
      });
    });

    // Menu button
    const menuBtn = this.add.text(60, btnY, "← Menu", {
      fontSize: "13px", color: "#6c3483", fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });
    menuBtn.on("pointerover", () => menuBtn.setColor("#9b59b6"));
    menuBtn.on("pointerout", () => menuBtn.setColor("#6c3483"));
    menuBtn.on("pointerdown", () => {
      this.game.events.emit("saveCharacter", this.sceneData.playerState);
      this.scene.start("MainMenuScene");
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private drawSeal(
    cx: number, cy: number, cellW: number, cellH: number,
    demon: (typeof DEMONS)[0], floor: number,
    isCleared: boolean, isCurrent: boolean, isLocked: boolean
  ) {
    const r = Math.min(cellW, cellH) / 2 - 3;
    const g = this.add.graphics();

    if (isCurrent) {
      // Pulsing gold seal
      g.fillStyle(demon.glowColor, 0.15);
      g.fillCircle(cx, cy, r + 4);
      g.lineStyle(2, 0xc9a227, 1);
      g.strokeCircle(cx, cy, r);
      g.fillStyle(0xc9a227, 0.2);
      g.fillCircle(cx, cy, r);
      this.tweens.add({ targets: g, alpha: { from: 1, to: 0.5 }, duration: 800, yoyo: true, repeat: -1 });

      this.add.text(cx, cy - 6, `${floor}`, { fontSize: "11px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(cx, cy + 6, demon.name.substring(0, 7), { fontSize: "8px", color: "#c9a227", fontFamily: "Georgia, serif" }).setOrigin(0.5);
    } else if (isCleared) {
      // Dimmed with glow color
      g.fillStyle(demon.color, 0.25);
      g.fillCircle(cx, cy, r);
      g.lineStyle(1, demon.glowColor, 0.4);
      g.strokeCircle(cx, cy, r);

      this.add.text(cx, cy - 4, `${floor}`, { fontSize: "9px", color: "#" + demon.glowColor.toString(16).padStart(6, "0") + "88", fontFamily: "Georgia, serif" }).setOrigin(0.5);
      // Checkmark
      const check = this.add.text(cx + r - 4, cy - r + 4, "✓", { fontSize: "8px", color: "#27ae60" }).setOrigin(0.5);
    } else if (isLocked) {
      // Dark locked seal
      g.fillStyle(0x0d0d18, 1);
      g.fillCircle(cx, cy, r);
      g.lineStyle(1, 0x1a1a2e, 1);
      g.strokeCircle(cx, cy, r);

      this.add.text(cx, cy, `${floor}`, { fontSize: "9px", color: "#2a2a3a", fontFamily: "Georgia, serif" }).setOrigin(0.5);
    }

    // Tooltip on hover for unlocked seals
    if (!isLocked) {
      const hitArea = this.add.circle(cx, cy, r, 0xffffff, 0).setInteractive({ cursor: "default" });
      let tooltip: Phaser.GameObjects.Container | null = null;

      hitArea.on("pointerover", () => {
        const bg = this.add.rectangle(cx, cy - r - 22, 120, 28, 0x12121a).setStrokeStyle(1, 0x2a1a3a).setDepth(10);
        const txt = this.add.text(cx, cy - r - 22, `${demon.rank} ${demon.name}`, { fontSize: "10px", color: "#c9a227", fontFamily: "Georgia, serif" }).setOrigin(0.5).setDepth(11);
        tooltip = this.add.container(0, 0, [bg, txt]);
      });
      hitArea.on("pointerout", () => { tooltip?.destroy(); tooltip = null; });
    }
  }

  private drawLegendDot(x: number, y: number, color: number) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillCircle(x, y, 5);
  }
}
