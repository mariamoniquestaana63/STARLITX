import Phaser from "phaser";
import { CharacterClass, getClass, getScaledStats, xpForLevel } from "../data/classes";
import { getDemon, getDemonStats, Demon, DemonEffect } from "../data/demons";
import { InventoryItem, getItem, rollItemDrop, addToInventory, removeFromInventory } from "../data/items";
import { soundManager } from "../audio/SoundManager";

export interface PlayerState {
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  floor: number;
  gold: number;
  demonsSlain: number;
  inventory: InventoryItem[];
  skillCooldowns: number[];
  buffNextAttack: boolean;
  defendingThisTurn: boolean;
  characterId?: string;
}

interface DemonState {
  demon: Demon;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

type BattlePhase = "player-turn" | "demon-turn" | "victory" | "defeat" | "animating";

export class BattleScene extends Phaser.Scene {
  private player!: PlayerState;
  private demonState!: DemonState;
  private phase: BattlePhase = "player-turn";

  // UI elements
  private playerHpBar!: Phaser.GameObjects.Rectangle;
  private playerMpBar!: Phaser.GameObjects.Rectangle;
  private demonHpBar!: Phaser.GameObjects.Rectangle;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerMpText!: Phaser.GameObjects.Text;
  private demonHpText!: Phaser.GameObjects.Text;
  private battleLog!: Phaser.GameObjects.Text;
  private playerSprite!: Phaser.GameObjects.Graphics;
  private demonSprite!: Phaser.GameObjects.Graphics;
  private logMessages: string[] = [];
  private itemOverlay: Phaser.GameObjects.Container | null = null;
  private attackBtnBorder!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "BattleScene" });
  }

  init(data: {
    characterName?: string;
    characterClass?: CharacterClass;
    floor?: number;
    playerState?: PlayerState;
  }) {
    if (data.playerState) {
      this.player = {
        ...data.playerState,
        defendingThisTurn: false,
        skillCooldowns: data.playerState.skillCooldowns ?? [0, 0],
        inventory: data.playerState.inventory ?? [],
        demonsSlain: data.playerState.demonsSlain ?? 0,
      };
    } else {
      const cls = data.characterClass || "warrior";
      const stats = getScaledStats(cls, 1);
      this.player = {
        name: data.characterName || "Hero",
        class: cls,
        level: 1,
        experience: 0,
        health: stats.health,
        maxHealth: stats.maxHealth,
        mp: 60,
        maxMp: 60,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        floor: data.floor || 1,
        gold: 0,
        demonsSlain: 0,
        inventory: [],
        skillCooldowns: [0, 0],
        buffNextAttack: false,
        defendingThisTurn: false,
      };
    }

    const demon = getDemon(this.player.floor);
    const dStats = getDemonStats(demon, this.player.floor);
    this.demonState = {
      demon,
      health: dStats.health,
      maxHealth: dStats.health,
      attack: dStats.attack,
      defense: dStats.defense,
      speed: dStats.speed,
    };
  }

  create() {
    const { width, height } = this.scale;
    this.logMessages = [];

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);
    const groundGrad = this.add.graphics();
    groundGrad.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x120820, 0x120820, 1);
    groundGrad.fillRect(0, height * 0.55, width, height * 0.45);
    const pillars = this.add.graphics();
    pillars.fillStyle(0x0d0d18, 1);
    for (let i = 0; i < 6; i++) pillars.fillRect((i * width) / 5 - 12, 0, 24, height * 0.55);

    // Floor info
    const demon = this.demonState.demon;
    this.add.text(width / 2, 18, `Floor ${this.player.floor} — ${demon.rank} ${demon.name}`, {
      fontSize: "16px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(width / 2, 37, `"${demon.title}"`, {
      fontSize: "11px", color: "#7f8c8d", fontFamily: "Georgia, serif", fontStyle: "italic",
    }).setOrigin(0.5);

    // Demon HUD
    const demonHudY = 62;
    this.add.text(width - 20, demonHudY, demon.name.toUpperCase(), {
      fontSize: "14px", color: "#" + demon.color.toString(16).padStart(6, "0"), fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(1, 0.5);
    this.add.rectangle(width - 20 - 80, demonHudY + 18, 160, 10, 0x1a1a2e);
    this.demonHpBar = this.add.rectangle(width - 20 - 160, demonHudY + 18, 160, 10, 0xdc2626).setOrigin(0, 0.5);
    this.demonHpText = this.add.text(width - 20, demonHudY + 29, `${this.demonState.health}/${this.demonState.maxHealth}`, {
      fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif",
    }).setOrigin(1, 0);

    // Player HUD
    const cls = getClass(this.player.class);
    this.add.text(20, demonHudY, this.player.name.toUpperCase(), {
      fontSize: "14px", color: "#" + cls.color.toString(16).padStart(6, "0"), fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0, 0.5);
    this.add.text(20, demonHudY + 16, `Lv.${this.player.level} ${cls.name} — ${this.player.gold}g`, {
      fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif",
    }).setOrigin(0, 0.5);
    this.add.rectangle(20 + 80, demonHudY + 34, 160, 10, 0x1a1a2e);
    this.playerHpBar = this.add.rectangle(20, demonHudY + 34, 160, 10, 0x27ae60).setOrigin(0, 0.5);
    this.playerHpText = this.add.text(20, demonHudY + 45, `HP ${this.player.health}/${this.player.maxHealth}`, {
      fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif",
    }).setOrigin(0, 0);
    this.add.rectangle(20 + 80, demonHudY + 58, 160, 6, 0x1a1a2e);
    this.playerMpBar = this.add.rectangle(20, demonHudY + 58, 160, 6, 0x2980b9).setOrigin(0, 0.5);
    this.playerMpText = this.add.text(20, demonHudY + 64, `MP ${this.player.mp}/${this.player.maxMp}`, {
      fontSize: "9px", color: "#5d6d7e", fontFamily: "Georgia, serif",
    }).setOrigin(0, 0);

    // Sprites
    this.playerSprite = this.add.graphics();
    this.drawPlayerSprite(this.playerSprite, 140, height * 0.48);
    this.demonSprite = this.add.graphics();
    this.drawDemonSprite(this.demonSprite, width - 140, height * 0.45);

    // Battle log
    const logY = height * 0.6;
    this.add.rectangle(width / 2, logY + 50, width - 40, 110, 0x0d0d18).setStrokeStyle(1, 0x1a1a2e);
    this.battleLog = this.add.text(20, logY + 10, "", {
      fontSize: "12px", color: "#bdc3c7", fontFamily: "Georgia, serif",
      wordWrap: { width: width - 60 }, lineSpacing: 4,
    });

    // Action buttons
    this.buildActionButtons(width, height);

    this.addLog(`${demon.name} emerges from the seal!`);
    this.addLog(`A ${demon.rank} — ${demon.description.split(".")[0]}.`);

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.updateUI();
  }

  // ── Action buttons ────────────────────────────────────────────────────────
  private buildActionButtons(width: number, height: number) {
    const cls = getClass(this.player.class);
    const btnY = height - 48;
    const btnW = 140;
    const btnH = 38;

    const actions = [
      { label: "Attack", color: 0xdc2626, key: "attack", sub: null },
      { label: cls.skills[0].name, color: 0x8e44ad, key: "skill0", sub: `MP:${cls.skills[0].mpCost}` },
      { label: cls.skills[1].name, color: 0x2980b9, key: "skill1", sub: `MP:${cls.skills[1].mpCost}` },
      { label: "Items", color: 0xc9a227, key: "items", sub: `×${this.player.inventory.reduce((s, i) => s + i.quantity, 0)}` },
    ];

    actions.forEach((action, i) => {
      const bx = 20 + i * (btnW + 8) + btnW / 2;
      const bg = this.add.rectangle(bx, btnY, btnW, btnH, 0x12121a).setInteractive({ cursor: "pointer" });
      const border = this.add.graphics();
      border.lineStyle(1, action.color, 0.6);
      border.strokeRect(bx - btnW / 2, btnY - btnH / 2, btnW, btnH);
      const txt = this.add.text(bx, action.sub ? btnY - 6 : btnY, action.label, {
        fontSize: "13px", color: "#" + action.color.toString(16).padStart(6, "0"),
        fontFamily: "Georgia, serif", fontStyle: "bold",
      }).setOrigin(0.5);
      if (action.sub) {
        this.add.text(bx, btnY + 9, action.sub, {
          fontSize: "9px", color: "#5d6d7e", fontFamily: "Georgia, serif",
        }).setOrigin(0.5);
      }

      bg.on("pointerover", () => { if (this.phase === "player-turn") bg.setFillStyle(0x1a0a2e); });
      bg.on("pointerout", () => bg.setFillStyle(0x12121a));
      bg.on("pointerdown", () => {
        if (this.phase !== "player-turn") return;
        if (action.key === "items") { this.openItemMenu(width, height); return; }
        this.handleAction(action.key as "attack" | "skill0" | "skill1");
      });
    });

    // Flee link (small, bottom right)
    const flee = this.add.text(width - 12, height - 12, "Flee", {
      fontSize: "11px", color: "#3d3d4f", fontFamily: "Georgia, serif",
    }).setOrigin(1, 1).setInteractive({ cursor: "pointer" });
    flee.on("pointerover", () => flee.setColor("#7f8c8d"));
    flee.on("pointerout", () => flee.setColor("#3d3d4f"));
    flee.on("pointerdown", () => {
      if (this.phase !== "player-turn") return;
      this.addLog("You flee back to the surface...");
      this.game.events.emit("saveCharacter", this.player);
      this.time.delayedCall(1000, () => this.scene.start("MainMenuScene"));
    });
  }

  // ── Item menu ─────────────────────────────────────────────────────────────
  private openItemMenu(width: number, height: number) {
    if (this.itemOverlay) return;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(20);
    const panel = this.add.rectangle(width / 2, height / 2, 320, 240, 0x12121a).setDepth(21).setStrokeStyle(1, 0x2a1a3a);

    this.add.text(width / 2, height / 2 - 100, "Inventory", {
      fontSize: "16px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(22);

    const items: Phaser.GameObjects.GameObject[] = [overlay, panel];

    if (this.player.inventory.length === 0) {
      const empty = this.add.text(width / 2, height / 2, "Your pack is empty.", {
        fontSize: "13px", color: "#5d6d7e", fontFamily: "Georgia, serif",
      }).setOrigin(0.5).setDepth(22);
      items.push(empty);
    } else {
      this.player.inventory.forEach((inv, idx) => {
        const item = getItem(inv.itemId);
        if (!item) return;
        const rowY = height / 2 - 65 + idx * 42;
        const rowBg = this.add.rectangle(width / 2, rowY, 290, 36, 0x0d0d18).setDepth(21).setInteractive({ cursor: "pointer" });
        const nameT = this.add.text(width / 2 - 130, rowY - 7, item.name, {
          fontSize: "12px", color: "#" + item.color.toString(16).padStart(6, "0"), fontFamily: "Georgia, serif", fontStyle: "bold",
        }).setDepth(22);
        const descT = this.add.text(width / 2 - 130, rowY + 7, item.description, {
          fontSize: "10px", color: "#7f8c8d", fontFamily: "Georgia, serif",
        }).setDepth(22);
        const qtyT = this.add.text(width / 2 + 130, rowY, `×${inv.quantity}`, {
          fontSize: "13px", color: "#c9a227", fontFamily: "Georgia, serif",
        }).setOrigin(1, 0.5).setDepth(22);

        rowBg.on("pointerover", () => rowBg.setFillStyle(0x1a0a2e));
        rowBg.on("pointerout", () => rowBg.setFillStyle(0x0d0d18));
        rowBg.on("pointerdown", () => {
          this.useItem(inv.itemId);
          this.itemOverlay?.destroy();
          this.itemOverlay = null;
        });

        items.push(rowBg, nameT, descT, qtyT);
      });
    }

    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + 100, "Close", {
      fontSize: "13px", color: "#6c3483", fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setDepth(22).setInteractive({ cursor: "pointer" });
    closeBtn.on("pointerdown", () => { this.itemOverlay?.destroy(); this.itemOverlay = null; });
    items.push(closeBtn);

    this.itemOverlay = this.add.container(0, 0, items as Phaser.GameObjects.GameObject[]).setDepth(20);
  }

  private useItem(itemId: string) {
    const item = getItem(itemId);
    if (!item) return;

    this.player.inventory = removeFromInventory(this.player.inventory, itemId);

    switch (item.effect) {
      case "heal_hp": {
        const healed = Math.min(item.value, this.player.maxHealth - this.player.health);
        this.player.health = Math.min(this.player.maxHealth, this.player.health + item.value);
        soundManager.playHeal();
        this.addLog(`Used ${item.name} — restored ${healed} HP.`);
        break;
      }
      case "heal_mp": {
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + item.value);
        soundManager.playItemUse();
        this.addLog(`Used ${item.name} — restored ${item.value} MP.`);
        break;
      }
      case "boost_attack": {
        this.player.buffNextAttack = true;
        soundManager.playItemUse();
        this.addLog(`Used ${item.name} — next attack is empowered!`);
        break;
      }
    }

    this.updateUI();
    this.time.delayedCall(400, () => this.demonAttack());
    this.phase = "animating";
  }

  // ── Combat ────────────────────────────────────────────────────────────────
  private handleAction(key: "attack" | "skill0" | "skill1") {
    const cls = getClass(this.player.class);
    this.player.defendingThisTurn = false;
    this.phase = "animating";

    if (key === "attack") {
      const crit = this.player.buffNextAttack || Math.random() < (this.player.class === "rogue" ? 0.15 : 0.05);
      const dmg = this.calcDamage(this.player.attack * (crit ? 2 : 1), this.demonState.defense);
      this.player.buffNextAttack = false;
      soundManager.playAttack();
      this.animatePlayerAttack(() => {
        this.applyDamageToDemon(dmg);
        this.addLog(`${this.player.name} strikes for ${dmg} damage.${crit ? " CRITICAL HIT!" : ""}`);
        this.checkDemonDeath();
      });
      return;
    }

    const idx = key === "skill0" ? 0 : 1;
    const skill = cls.skills[idx];

    if (this.player.skillCooldowns[idx] > 0) {
      this.addLog(`${skill.name} is on cooldown (${this.player.skillCooldowns[idx]} turns).`);
      this.phase = "player-turn";
      return;
    }
    if (this.player.mp < skill.mpCost) {
      this.addLog(`Not enough MP for ${skill.name}!`);
      this.phase = "player-turn";
      return;
    }

    this.player.mp = Math.max(0, this.player.mp - skill.mpCost);
    this.player.skillCooldowns[idx] = skill.cooldown;

    if (skill.effect === "damage") {
      const dmg = this.calcDamage(Math.floor(this.player.attack * skill.multiplier), this.demonState.defense);
      soundManager.playMagic();
      this.animatePlayerAttack(() => {
        this.applyDamageToDemon(dmg);
        this.addLog(`${this.player.name} uses ${skill.name} for ${dmg} damage!`);
        this.checkDemonDeath();
      });
    } else if (skill.effect === "heal") {
      const heal = Math.floor(this.player.maxHealth * skill.multiplier);
      this.player.health = Math.min(this.player.maxHealth, this.player.health + heal);
      soundManager.playHeal();
      this.addLog(`${this.player.name} uses ${skill.name}, restoring ${heal} HP!`);
      this.updateUI();
      this.time.delayedCall(800, () => this.demonAttack());
    } else if (skill.effect === "buff") {
      if (this.player.class === "rogue" && skill.name === "Vanish") {
        this.player.buffNextAttack = true;
        this.addLog(`${this.player.name} vanishes — next attack is guaranteed crit!`);
      } else {
        this.player.defendingThisTurn = true;
        this.addLog(`${this.player.name} activates ${skill.name}!`);
      }
      soundManager.playClick();
      this.updateUI();
      this.time.delayedCall(800, () => this.demonAttack());
    }
  }

  private checkDemonDeath() {
    this.updateUI();
    if (this.demonState.health <= 0) {
      this.phase = "victory";
      this.handleVictory();
    } else {
      this.time.delayedCall(600, () => this.demonAttack());
    }
  }

  private demonAttack() {
    const demon = this.demonState.demon;
    const ability = demon.abilities[Math.floor(Math.random() * demon.abilities.length)];
    const isSpecial = Math.random() < 0.25;
    const baseDmg = isSpecial ? Math.floor(this.demonState.attack * 1.6) : this.demonState.attack;
    const defFactor = this.player.defendingThisTurn ? 0.5 : 1;
    const dmg = Math.max(1, Math.floor((baseDmg - this.player.defense / 2 + Phaser.Math.Between(-3, 3)) * defFactor));

    if (isSpecial) {
      soundManager.playDemonSpecial();
      this.showDemonEffect(140, this.scale.height * 0.48, demon.effect);
    } else {
      soundManager.playHit();
    }

    this.animateDemonAttack(() => {
      this.player.health = Math.max(0, this.player.health - dmg);
      this.addLog(`${demon.name} attacks for ${dmg} damage!${isSpecial ? ` (${ability}!)` : ""}`);
      this.player.skillCooldowns = this.player.skillCooldowns.map((cd) => Math.max(0, cd - 1));
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + 5);
      this.updateUI();
      if (this.player.health <= 0) { this.phase = "defeat"; this.handleDefeat(); }
      else this.phase = "player-turn";
    });
  }

  // ── Victory ───────────────────────────────────────────────────────────────
  private handleVictory() {
    const dStats = getDemonStats(this.demonState.demon, this.player.floor);
    this.player.experience += dStats.xpReward;
    this.player.gold += dStats.goldReward;
    this.player.demonsSlain = (this.player.demonsSlain ?? 0) + 1;

    // Item drop
    const drop = rollItemDrop(this.player.floor);
    let lastDrop: { itemName: string } | null = null;
    if (drop) {
      const item = getItem(drop.itemId);
      if (item) {
        this.player.inventory = addToInventory(this.player.inventory, drop);
        this.addLog(`★ Dropped: ${item.name}!`);
        lastDrop = { itemName: item.name };
      }
    }

    // Level up
    const xpNeeded = xpForLevel(this.player.level);
    if (this.player.experience >= xpNeeded) {
      this.player.level++;
      this.player.experience -= xpNeeded;
      const newStats = getScaledStats(this.player.class, this.player.level);
      const hpGain = newStats.maxHealth - this.player.maxHealth;
      this.player.maxHealth = newStats.maxHealth;
      this.player.health = Math.min(this.player.maxHealth, this.player.health + Math.floor(hpGain / 2));
      this.player.attack = newStats.attack;
      this.player.defense = newStats.defense;
      this.addLog(`★ LEVEL UP! You are now level ${this.player.level}!`);
      soundManager.playLevelUp();
    } else {
      soundManager.playVictory();
    }

    this.player.floor++;

    // Emit save event
    this.game.events.emit("saveCharacter", this.player);

    if (this.player.floor > 72) {
      this.time.delayedCall(1500, () => this.scene.start("MainMenuScene"));
      return;
    }

    // Collect cleared floors from game registry
    const clearedFloors: number[] = this.registry.get("clearedFloors") ?? [];
    clearedFloors.push(this.player.floor - 1);
    this.registry.set("clearedFloors", clearedFloors);

    this.time.delayedCall(1400, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("OverworldScene", {
          playerState: this.player,
          clearedFloors,
          lastDrop,
        });
      });
    });

    this.addLog(`Victory! +${dStats.xpReward} XP  +${dStats.goldReward}g`);
  }

  // ── Defeat ────────────────────────────────────────────────────────────────
  private handleDefeat() {
    const { width, height } = this.scale;
    this.addLog("You have fallen in the Abyss...");
    soundManager.playDefeat();
    this.game.events.emit("saveCharacter", this.player);

    this.time.delayedCall(1200, () => {
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(20);
      this.add.text(width / 2, height / 2 - 50, "DEFEATED", {
        fontSize: "40px", color: "#dc2626", fontFamily: "Georgia, serif", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(21);
      this.add.text(width / 2, height / 2, `Reached Floor ${this.player.floor}  •  Level ${this.player.level}`, {
        fontSize: "16px", color: "#7f8c8d", fontFamily: "Georgia, serif",
      }).setOrigin(0.5).setDepth(21);

      const menuBtn = this.add.rectangle(width / 2, height / 2 + 70, 200, 42, 0x1a0a2e).setDepth(21).setInteractive({ cursor: "pointer" }).setStrokeStyle(2, 0xdc2626);
      this.add.text(width / 2, height / 2 + 70, "Return to Menu", {
        fontSize: "15px", color: "#dc2626", fontFamily: "Georgia, serif",
      }).setOrigin(0.5).setDepth(22);
      menuBtn.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("MainMenuScene"));
      });
    });
  }

  // ── Animations ────────────────────────────────────────────────────────────
  private animatePlayerAttack(onHit: () => void) {
    this.tweens.add({
      targets: this.playerSprite, x: 80, duration: 100,
      onComplete: () => {
        this.tweens.add({ targets: this.playerSprite, x: 140, duration: 200, onComplete: () => onHit() });
      },
    });
    this.time.delayedCall(100, () => {
      this.tweens.add({ targets: this.demonSprite, alpha: 0.3, duration: 80, yoyo: true, repeat: 1 });
    });
  }

  private animateDemonAttack(onHit: () => void) {
    const { width } = this.scale;
    this.tweens.add({
      targets: this.demonSprite, x: width - 220, duration: 100,
      onComplete: () => {
        this.tweens.add({ targets: this.demonSprite, x: width - 140, duration: 200, onComplete: () => onHit() });
      },
    });
    this.time.delayedCall(100, () => {
      this.tweens.add({ targets: this.playerSprite, alpha: 0.3, duration: 80, yoyo: true, repeat: 1 });
    });
  }

  // ── Sprite drawing ────────────────────────────────────────────────────────
  private drawPlayerSprite(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.x = x; g.y = y; g.clear();
    const c = getClass(this.player.class).color;
    const hpRatio = this.player.health / this.player.maxHealth;

    g.fillStyle(c, 0.8); g.fillRect(-18, -50, 36, 50);
    g.fillStyle(c, 1); g.fillCircle(0, -62, 16);
    if (hpRatio < 0.3) { g.fillStyle(0xff0000, 0.2); g.fillRect(-18, -50, 36, 50); }

    switch (this.player.class) {
      case "warrior": g.fillStyle(0xaaaaaa, 0.9); g.fillRect(-4, -75, 8, 30); g.fillRect(-12, -55, 24, 6); break;
      case "mage": g.fillStyle(0xaa44ff, 0.9); g.fillCircle(0, -80, 8); break;
      case "rogue": g.fillStyle(0x44aa66, 0.9); g.fillRect(-4, -72, 6, 22); break;
      case "cleric": g.lineStyle(2, 0xffdd44, 0.9); g.lineBetween(-10, -70, 10, -70); g.lineBetween(0, -78, 0, -62); break;
    }
  }

  private drawDemonSprite(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.x = x; g.y = y; g.clear();
    const { color: c, glowColor: gc } = this.demonState.demon;
    const hpRatio = this.demonState.health / this.demonState.maxHealth;

    g.fillStyle(gc, 0.08); g.fillCircle(0, -40, 70);
    g.fillStyle(c, 0.9); g.fillTriangle(-30, 0, 30, 0, 0, -80);
    g.fillStyle(c, 1); g.fillRect(-22, -55, 44, 55);
    g.fillStyle(gc, 1); g.fillCircle(-8, -65, 5); g.fillCircle(8, -65, 5);
    g.fillStyle(0x000000, 1); g.fillCircle(-8, -65, 2); g.fillCircle(8, -65, 2);
    g.lineStyle(3, gc, 0.9);
    g.beginPath(); g.moveTo(-10, -80); g.lineTo(-20, -100); g.strokePath();
    g.beginPath(); g.moveTo(10, -80); g.lineTo(20, -100); g.strokePath();
    if (hpRatio < 0.3) { g.fillStyle(0xff0000, 0.15); g.fillCircle(0, -40, 70); }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  private updateUI() {
    const pr = this.player.health / this.player.maxHealth;
    const mr = this.player.mp / this.player.maxMp;
    const dr = Math.max(0, this.demonState.health / this.demonState.maxHealth);

    this.playerHpBar.width = 160 * pr;
    this.playerHpBar.setFillStyle(pr > 0.5 ? 0x27ae60 : pr > 0.25 ? 0xe67e22 : 0xdc2626);
    this.playerHpText.setText(`HP ${this.player.health}/${this.player.maxHealth}`);
    this.playerMpBar.width = 160 * mr;
    this.playerMpText.setText(`MP ${this.player.mp}/${this.player.maxMp}`);
    this.demonHpBar.width = 160 * dr;
    this.demonHpText.setText(`${this.demonState.health}/${this.demonState.maxHealth}`);

    const { height, width } = this.scale;
    this.drawPlayerSprite(this.playerSprite, 140, height * 0.48);
    this.drawDemonSprite(this.demonSprite, width - 140, height * 0.45);
  }

  private addLog(message: string) {
    this.logMessages.push(message);
    if (this.logMessages.length > 5) this.logMessages.shift();
    this.battleLog.setText(this.logMessages.join("\n"));
  }

  private showDemonEffect(x: number, y: number, effect: DemonEffect) {
    const effectColors: Record<DemonEffect, number> = {
      fire: 0xff4500, shadow: 0x6a0dad, lightning: 0xffff00,
      poison: 0x39ff14, ice: 0x00bfff, holy: 0xffffff, void: 0x110011, blood: 0xcc0000,
    };
    const color = effectColors[effect] ?? 0xff4500;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const g = this.add.graphics().setDepth(15);
      g.fillStyle(color, 0.9);
      g.fillCircle(0, 0, effect === "lightning" ? 3 : 5);
      g.x = x;
      g.y = y;
      this.tweens.add({
        targets: g,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 450,
        ease: "Power2",
        onComplete: () => g.destroy(),
      });
    }

    const flash = this.add.rectangle(x, y - 30, 60, 80, color, 0.25).setDepth(14);
    this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
  }

  private calcDamage(attack: number, defense: number): number {
    return Math.max(1, Math.floor(attack - defense / 2 + Phaser.Math.Between(-4, 4)));
  }

  private applyDamageToDemon(dmg: number) {
    this.demonState.health = Math.max(0, this.demonState.health - dmg);
  }
}
