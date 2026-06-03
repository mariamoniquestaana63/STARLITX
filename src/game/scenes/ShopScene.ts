import Phaser from "phaser";
import { getFloorShop, scaledCost, ShopItem } from "../data/shop";
import { addToInventory, getItem } from "../data/items";
import { getClass } from "../data/classes";
import { soundManager } from "../audio/SoundManager";
import type { PlayerState } from "./BattleScene";

interface ShopData {
  playerState: PlayerState;
  clearedFloors: number[];
}

export class ShopScene extends Phaser.Scene {
  private sceneData!: ShopData;
  private player!: PlayerState;
  private goldText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "ShopScene" });
  }

  init(data: ShopData) {
    this.sceneData = data;
    this.player = { ...data.playerState };
  }

  create() {
    const { width, height } = this.scale;
    soundManager.resume();

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);
    const glow = this.add.graphics();
    glow.fillStyle(0x3d0a4f, 0.12);
    glow.fillCircle(width / 2, height / 2, 300);

    // Decorative border
    const border = this.add.graphics();
    border.lineStyle(1, 0x2a1a3a, 1);
    border.strokeRect(20, 20, width - 40, height - 40);
    border.lineStyle(1, 0xc9a227, 0.2);
    border.strokeRect(24, 24, width - 48, height - 48);

    // Header
    this.add.text(width / 2, 38, "The Abyssal Merchant", {
      fontSize: "22px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(width / 2, 62, `"I trade in power. Gold is merely the medium."`, {
      fontSize: "12px", color: "#7f8c8d", fontFamily: "Georgia, serif", fontStyle: "italic",
    }).setOrigin(0.5);

    const divG = this.add.graphics();
    divG.lineStyle(1, 0x2a1a3a, 1);
    divG.lineBetween(40, 80, width - 40, 80);

    // Gold display
    const cls = getClass(this.player.class);
    this.add.text(20, 92, `${this.player.name}  •  Lv.${this.player.level} ${cls.name}  •  Floor ${this.player.floor}`, {
      fontSize: "12px", color: "#" + cls.color.toString(16).padStart(6, "0"), fontFamily: "Georgia, serif",
    });
    this.goldText = this.add.text(width - 20, 92, `${this.player.gold}g`, {
      fontSize: "16px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(1, 0);

    // Feedback text
    this.feedbackText = this.add.text(width / 2, 115, "", {
      fontSize: "13px", color: "#27ae60", fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    // Shop items
    const items = getFloorShop(this.player.floor);
    const cardW = (width - 60) / 2 - 8;
    const cardH = 140;
    const startY = 135;

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 30 + col * (cardW + 16) + cardW / 2;
      const cy = startY + row * (cardH + 12) + cardH / 2;
      const cost = scaledCost(item, this.player.floor);
      this.createShopCard(cx, cy, cardW, cardH, item, cost);
    });

    // Inventory preview
    const invY = startY + 2 * (cardH + 12) + 20;
    this.add.text(width / 2, invY, "Your Pack", {
      fontSize: "13px", color: "#7f8c8d", fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    if (this.player.inventory.length === 0) {
      this.add.text(width / 2, invY + 20, "Empty", { fontSize: "11px", color: "#3d3d4f", fontFamily: "Georgia, serif" }).setOrigin(0.5);
    } else {
      const invStr = this.player.inventory
        .map((inv) => {
          const it = getItem(inv.itemId);
          return `${it?.name ?? inv.itemId} ×${inv.quantity}`;
        })
        .join("   ");
      this.add.text(width / 2, invY + 20, invStr, {
        fontSize: "11px", color: "#bdc3c7", fontFamily: "Georgia, serif",
      }).setOrigin(0.5);
    }

    // Continue button
    const btnY = height - 38;
    const btn = this.add.rectangle(width / 2, btnY, 220, 36, 0x1a0a2e)
      .setInteractive({ cursor: "pointer" })
      .setStrokeStyle(2, 0xc9a227);
    const btnTxt = this.add.text(width / 2, btnY, `Descend to Floor ${this.player.floor}`, {
      fontSize: "14px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    btn.on("pointerover", () => { btn.setFillStyle(0x2d1050); btnTxt.setColor("#ffffff"); });
    btn.on("pointerout", () => { btn.setFillStyle(0x1a0a2e); btnTxt.setColor("#c9a227"); });
    btn.on("pointerdown", () => {
      soundManager.playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BattleScene", { playerState: this.player });
      });
    });

    // Skip shop link
    this.add.text(width - 20, btnY, "← Map", {
      fontSize: "12px", color: "#3d3d4f", fontFamily: "Georgia, serif",
    }).setOrigin(1, 0.5).setInteractive({ cursor: "pointer" })
      .on("pointerover", function(this: Phaser.GameObjects.Text) { this.setColor("#7f8c8d"); })
      .on("pointerout", function(this: Phaser.GameObjects.Text) { this.setColor("#3d3d4f"); })
      .on("pointerdown", () => {
        this.scene.start("OverworldScene", {
          playerState: this.player,
          clearedFloors: this.sceneData.clearedFloors,
        });
      });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private createShopCard(cx: number, cy: number, cardW: number, cardH: number, item: ShopItem, cost: number) {
    const canAfford = this.player.gold >= cost;
    const borderColor = canAfford ? item.color : 0x2a1a3a;
    const textColor = "#" + item.color.toString(16).padStart(6, "0");

    const bg = this.add.rectangle(cx, cy, cardW, cardH, 0x0d0d18)
      .setStrokeStyle(1, borderColor)
      .setInteractive({ cursor: canAfford ? "pointer" : "not-allowed" });

    // Icon area
    const iconG = this.add.graphics();
    iconG.fillStyle(item.color, 0.15);
    iconG.fillCircle(cx, cy - 30, 22);
    iconG.fillStyle(item.color, 0.6);
    iconG.fillCircle(cx, cy - 30, 12);

    // Type badge
    const badgeColor = item.type === "upgrade" ? 0x8e44ad : 0x2980b9;
    this.add.rectangle(cx, cy - 58, 60, 14, badgeColor, 0.3);
    this.add.text(cx, cy - 58, item.type === "upgrade" ? "UPGRADE" : "ITEM", {
      fontSize: "8px", color: "#" + badgeColor.toString(16).padStart(6, "0"),
      fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(cx, cy - 4, item.name, {
      fontSize: "13px", color: textColor, fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(cx, cy + 14, item.description, {
      fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif",
      wordWrap: { width: cardW - 20 }, align: "center",
    }).setOrigin(0.5, 0);

    const costColor = canAfford ? "#c9a227" : "#dc2626";
    this.add.text(cx, cy + 48, `${cost}g`, {
      fontSize: "15px", color: costColor, fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    if (canAfford) {
      bg.on("pointerover", () => bg.setFillStyle(0x1a0a2e));
      bg.on("pointerout", () => bg.setFillStyle(0x0d0d18));
      bg.on("pointerdown", () => this.purchase(item, cost));
    }
  }

  private purchase(item: ShopItem, cost: number) {
    if (this.player.gold < cost) return;
    this.player.gold -= cost;
    soundManager.playPurchase();

    if (item.inventoryItemId) {
      this.player.inventory = addToInventory(this.player.inventory, { itemId: item.inventoryItemId, quantity: 1 });
      this.showFeedback(`Purchased ${item.name}!`);
    } else if (item.statBoost) {
      const { stat, amount } = item.statBoost;
      const p = this.player as unknown as Record<string, number>;
      p[stat] = (p[stat] ?? 0) + amount;
      if (stat === "maxHealth") this.player.health = Math.min(this.player.health + amount, this.player.maxHealth);
      this.showFeedback(`${item.name} applied! +${amount} ${stat.replace("max", "max ").toUpperCase()}`);
    }

    this.goldText.setText(`${this.player.gold}g`);
    this.game.events.emit("saveCharacter", this.player);

    // Refresh scene to update affordability
    this.time.delayedCall(600, () => {
      this.scene.restart({ playerState: this.player, clearedFloors: this.sceneData.clearedFloors });
    });
  }

  private showFeedback(msg: string) {
    this.feedbackText.setText(msg);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: { from: 1, to: 0 },
      y: { from: 115, to: 100 },
      duration: 2000,
      onComplete: () => { this.feedbackText.setAlpha(1).setY(115).setText(""); },
    });
  }
}
