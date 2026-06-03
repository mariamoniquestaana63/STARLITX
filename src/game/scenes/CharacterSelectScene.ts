import Phaser from "phaser";
import { CLASSES, CharacterClass, ClassDefinition, getClass } from "../data/classes";
import type { PlayerState } from "./BattleScene";

export class CharacterSelectScene extends Phaser.Scene {
  private selectedClass: CharacterClass | null = null;
  private nameInput: HTMLInputElement | null = null;
  private onCharacterCreate?: (name: string, cls: CharacterClass) => void;

  constructor() {
    super({ key: "CharacterSelectScene" });
  }

  init(data: { onCharacterCreate?: (name: string, cls: CharacterClass) => void }) {
    this.onCharacterCreate = data.onCharacterCreate;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    // Continue saved character banner
    const saved = this.registry.get("savedCharacter") as PlayerState | null;
    if (saved) {
      const cls = getClass(saved.class);
      const banner = this.add.rectangle(width / 2, height - 30, width - 40, 38, 0x1a0a2e)
        .setStrokeStyle(2, cls.color)
        .setInteractive({ cursor: "pointer" });
      this.add.text(width / 2, height - 30,
        `Continue  "${saved.name}"  —  Lv.${saved.level} ${cls.name}  •  Floor ${saved.floor}`, {
        fontSize: "13px", color: "#" + cls.color.toString(16).padStart(6, "0"),
        fontFamily: "Georgia, serif", fontStyle: "bold",
      }).setOrigin(0.5);
      banner.on("pointerover", () => banner.setFillStyle(0x2d1050));
      banner.on("pointerout", () => banner.setFillStyle(0x1a0a2e));
      banner.on("pointerdown", () => {
        this.cleanupDOM();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("OverworldScene", {
            playerState: saved,
            clearedFloors: this.registry.get("clearedFloors") ?? [],
          });
        });
      });
    }

    // Header
    this.add.text(width / 2, 32, "Choose Your Class", {
      fontSize: "30px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, 65, "Each class walks a different path through the Abyss.", {
      fontSize: "13px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(1, 0x2a1a3a, 1);
    div.lineBetween(40, 82, width - 40, 82);

    // Class cards
    const cardW = Math.floor((width - 80) / 4) - 8;
    const cardH = 290;
    const startX = 40;
    const cardY = 115;

    CLASSES.forEach((cls, i) => {
      const x = startX + i * (cardW + 8) + cardW / 2;
      this.createClassCard(x, cardY, cardW, cardH, cls);
    });

    // Name input area (DOM)
    const nameAreaY = cardY + cardH + 30;

    this.add.text(width / 2, nameAreaY, "Name Your Hero", {
      fontSize: "18px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    // HTML input
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.placeholder = "Enter name...";
    this.nameInput.maxLength = 20;
    this.nameInput.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: ${nameAreaY + 28}px;
      width: 260px;
      height: 38px;
      background: #12121a;
      border: 1px solid #2a1a3a;
      border-radius: 4px;
      color: #c9a227;
      font-size: 16px;
      font-family: Georgia, serif;
      text-align: center;
      padding: 0 12px;
      outline: none;
      z-index: 100;
    `;
    this.nameInput.addEventListener("focus", () => {
      this.nameInput!.style.borderColor = "#c9a227";
    });
    this.nameInput.addEventListener("blur", () => {
      this.nameInput!.style.borderColor = "#2a1a3a";
    });
    this.game.canvas.parentElement?.appendChild(this.nameInput);

    // Begin button
    const beginY = nameAreaY + 85;
    const beginBtn = this.add.rectangle(width / 2, beginY, 220, 46, 0x1a0a2e)
      .setInteractive({ cursor: "pointer" });
    const beginBorder = this.add.graphics();
    beginBorder.lineStyle(2, 0x3d1a5e, 1);
    beginBorder.strokeRect(width / 2 - 110, beginY - 23, 220, 46);
    const beginText = this.add.text(width / 2, beginY, "BEGIN YOUR DESCENT", {
      fontSize: "15px",
      color: "#6c3483",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    beginBtn.on("pointerover", () => {
      if (this.selectedClass) {
        beginBtn.setFillStyle(0x2d1050);
        beginText.setColor("#c9a227");
        beginBorder.clear();
        beginBorder.lineStyle(2, 0xc9a227, 1);
        beginBorder.strokeRect(width / 2 - 110, beginY - 23, 220, 46);
      }
    });
    beginBtn.on("pointerout", () => {
      if (!this.selectedClass) return;
      beginBtn.setFillStyle(0x1a0a2e);
      beginText.setColor(this.selectedClass ? "#9b59b6" : "#6c3483");
    });

    beginBtn.on("pointerdown", () => {
      if (!this.selectedClass) {
        this.flashMessage("Select a class first!", 0xdc2626);
        return;
      }
      const name = this.nameInput?.value.trim();
      if (!name) {
        this.flashMessage("Enter a name!", 0xdc2626);
        return;
      }
      this.startGame(name, this.selectedClass);
    });

    // Back button
    const backBtn = this.add.text(60, 32, "← Back", {
      fontSize: "14px",
      color: "#6c3483",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });
    backBtn.on("pointerover", () => backBtn.setColor("#9b59b6"));
    backBtn.on("pointerout", () => backBtn.setColor("#6c3483"));
    backBtn.on("pointerdown", () => {
      this.cleanupDOM();
      this.scene.start("MainMenuScene");
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createClassCard(
    cx: number,
    cardTop: number,
    cardW: number,
    cardH: number,
    cls: ClassDefinition
  ) {
    const cardBg = this.add.rectangle(cx, cardTop + cardH / 2, cardW, cardH, 0x12121a)
      .setInteractive({ cursor: "pointer" });
    const border = this.add.graphics();
    border.lineStyle(1, 0x2a1a3a, 1);
    border.strokeRect(cx - cardW / 2, cardTop, cardW, cardH);

    // Class icon (colored symbol)
    const icon = this.add.graphics();
    this.drawClassIcon(icon, cx, cardTop + 48, 32, cls);

    // Class name
    const nameText = this.add.text(cx, cardTop + 92, cls.name.toUpperCase(), {
      fontSize: "16px",
      color: "#" + cls.color.toString(16).padStart(6, "0"),
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Title
    this.add.text(cx, cardTop + 113, cls.title, {
      fontSize: "10px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    }).setOrigin(0.5);

    // Description
    this.add.text(cx, cardTop + 140, cls.description, {
      fontSize: "11px",
      color: "#bdc3c7",
      fontFamily: "Georgia, serif",
      wordWrap: { width: cardW - 16 },
      align: "center",
    }).setOrigin(0.5, 0);

    // Stats
    const stats = cls.stats;
    const statY = cardTop + 195;
    const statColor = "#7f8c8d";
    const valColor = "#c9a227";

    this.add.text(cx - cardW / 2 + 10, statY, "HP", { fontSize: "10px", color: statColor, fontFamily: "Georgia, serif" });
    this.add.text(cx + cardW / 2 - 10, statY, `${stats.health}`, { fontSize: "10px", color: valColor, fontFamily: "Georgia, serif" }).setOrigin(1, 0);
    this.drawStatBar(cx, statY + 14, cardW - 20, stats.health, 150, cls.color);

    this.add.text(cx - cardW / 2 + 10, statY + 26, "ATK", { fontSize: "10px", color: statColor, fontFamily: "Georgia, serif" });
    this.add.text(cx + cardW / 2 - 10, statY + 26, `${stats.attack}`, { fontSize: "10px", color: valColor, fontFamily: "Georgia, serif" }).setOrigin(1, 0);
    this.drawStatBar(cx, statY + 40, cardW - 20, stats.attack, 36, cls.color);

    this.add.text(cx - cardW / 2 + 10, statY + 52, "DEF", { fontSize: "10px", color: statColor, fontFamily: "Georgia, serif" });
    this.add.text(cx + cardW / 2 - 10, statY + 52, `${stats.defense}`, { fontSize: "10px", color: valColor, fontFamily: "Georgia, serif" }).setOrigin(1, 0);
    this.drawStatBar(cx, statY + 66, cardW - 20, stats.defense, 16, cls.color);

    this.add.text(cx - cardW / 2 + 10, statY + 78, "SPD", { fontSize: "10px", color: statColor, fontFamily: "Georgia, serif" });
    this.add.text(cx + cardW / 2 - 10, statY + 78, `${stats.speed}`, { fontSize: "10px", color: valColor, fontFamily: "Georgia, serif" }).setOrigin(1, 0);
    this.drawStatBar(cx, statY + 92, cardW - 20, stats.speed, 22, cls.color);

    // Hover / select behavior
    cardBg.on("pointerover", () => {
      if (this.selectedClass !== cls.id) {
        border.clear();
        border.lineStyle(1, cls.color, 0.6);
        border.strokeRect(cx - cardW / 2, cardTop, cardW, cardH);
        cardBg.setFillStyle(0x1a0a2e);
      }
    });
    cardBg.on("pointerout", () => {
      if (this.selectedClass !== cls.id) {
        border.clear();
        border.lineStyle(1, 0x2a1a3a, 1);
        border.strokeRect(cx - cardW / 2, cardTop, cardW, cardH);
        cardBg.setFillStyle(0x12121a);
      }
    });
    cardBg.on("pointerdown", () => {
      this.selectedClass = cls.id;
      // Reset all cards
      this.children.list.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Rectangle && child !== cardBg) {
          child.setFillStyle(0x12121a);
        }
      });
      cardBg.setFillStyle(0x1a0a2e);
      border.clear();
      border.lineStyle(2, cls.color, 1);
      border.strokeRect(cx - cardW / 2, cardTop, cardW, cardH);
    });
  }

  private drawClassIcon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, cls: ClassDefinition) {
    g.clear();
    g.lineStyle(2, cls.color, 0.9);
    g.fillStyle(cls.color, 0.15);

    switch (cls.id) {
      case "warrior":
        // Sword
        g.beginPath();
        g.moveTo(cx, cy - size);
        g.lineTo(cx, cy + size);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx - size * 0.5, cy - size * 0.2);
        g.lineTo(cx + size * 0.5, cy - size * 0.2);
        g.strokePath();
        break;
      case "mage":
        // Star
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const r1 = size;
          const r2 = size * 0.4;
          const ax = cx + r1 * Math.cos(a - Math.PI / 2);
          const ay = cy + r1 * Math.sin(a - Math.PI / 2);
          const bx = cx + r2 * Math.cos(a + Math.PI / 6 - Math.PI / 2);
          const by = cy + r2 * Math.sin(a + Math.PI / 6 - Math.PI / 2);
          if (i === 0) {
            g.beginPath();
            g.moveTo(ax, ay);
          } else {
            g.lineTo(bx, by);
            g.lineTo(ax, ay);
          }
        }
        g.closePath();
        g.strokePath();
        break;
      case "rogue":
        // Dagger (rotated)
        g.beginPath();
        g.moveTo(cx - size * 0.7, cy + size * 0.7);
        g.lineTo(cx + size * 0.7, cy - size * 0.7);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx + size * 0.3, cy - size * 0.5);
        g.lineTo(cx + size * 0.7, cy - size * 0.7);
        g.lineTo(cx + size * 0.5, cy - size * 0.3);
        g.strokePath();
        break;
      case "cleric":
        // Cross
        g.beginPath();
        g.moveTo(cx, cy - size);
        g.lineTo(cx, cy + size);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx - size * 0.6, cy - size * 0.3);
        g.lineTo(cx + size * 0.6, cy - size * 0.3);
        g.strokePath();
        break;
    }
  }

  private drawStatBar(cx: number, y: number, w: number, value: number, max: number, color: number) {
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(cx - w / 2, y, w, 5);
    g.fillStyle(color, 0.7);
    g.fillRect(cx - w / 2, y, w * Math.min(value / max, 1), 5);
  }

  private flashMessage(msg: string, color: number) {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height - 60, msg, {
      fontSize: "14px",
      color: "#" + color.toString(16).padStart(6, "0"),
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({
      targets: txt,
      alpha: 0,
      y: height - 80,
      duration: 2000,
      onComplete: () => txt.destroy(),
    });
  }

  private startGame(name: string, cls: CharacterClass) {
    this.cleanupDOM();
    if (this.onCharacterCreate) {
      this.onCharacterCreate(name, cls);
    }
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("BattleScene", { characterName: name, characterClass: cls, floor: 1 });
    });
  }

  private cleanupDOM() {
    if (this.nameInput && this.nameInput.parentElement) {
      this.nameInput.parentElement.removeChild(this.nameInput);
    }
    this.nameInput = null;
  }

  shutdown() {
    this.cleanupDOM();
  }
}
