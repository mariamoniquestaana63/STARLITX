import Phaser from "phaser";
import { CharacterClass, getClass, getScaledStats, xpForLevel } from "../data/classes";
import { getDemon, getDemonStats, Demon } from "../data/demons";

interface PlayerState {
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
  skillCooldowns: number[];
  buffNextAttack: boolean;
  defendingThisTurn: boolean;
}

interface DemonState {
  demon: Demon;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

type BattlePhase = "player-turn" | "demon-turn" | "victory" | "defeat" | "level-up" | "animating";

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
  private actionBtns: Phaser.GameObjects.Container[] = [];
  private playerSprite!: Phaser.GameObjects.Graphics;
  private demonSprite!: Phaser.GameObjects.Graphics;
  private floorText!: Phaser.GameObjects.Text;
  private logMessages: string[] = [];

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
      this.player = { ...data.playerState };
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

    // ── Background ──────────────────────────────────────────────────────────
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    // Abyss ground
    const groundGrad = this.add.graphics();
    groundGrad.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x120820, 0x120820, 1);
    groundGrad.fillRect(0, height * 0.55, width, height * 0.45);

    // Background pillars
    const pillars = this.add.graphics();
    pillars.fillStyle(0x0d0d18, 1);
    for (let i = 0; i < 6; i++) {
      const px = (i * width) / 5;
      pillars.fillRect(px - 12, 0, 24, height * 0.55);
    }

    // Floor info
    const demon = this.demonState.demon;
    this.floorText = this.add.text(width / 2, 18, `Floor ${this.player.floor} — ${demon.rank} ${demon.name}`, {
      fontSize: "16px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, 37, `"${demon.title}"`, {
      fontSize: "11px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    }).setOrigin(0.5);

    // ── Demon HUD ────────────────────────────────────────────────────────────
    const demonHudY = 62;
    this.add.text(width - 20, demonHudY, demon.name.toUpperCase(), {
      fontSize: "14px",
      color: "#" + demon.color.toString(16).padStart(6, "0"),
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(1, 0.5);

    this.add.rectangle(width - 20 - 160 / 2, demonHudY + 18, 160, 10, 0x1a1a2e);
    this.demonHpBar = this.add.rectangle(width - 20 - 160, demonHudY + 18, 160, 10, 0xdc2626).setOrigin(0, 0.5);
    this.demonHpText = this.add.text(width - 20, demonHudY + 29, `${this.demonState.health}/${this.demonState.maxHealth}`, {
      fontSize: "10px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
    }).setOrigin(1, 0);

    // ── Player HUD ───────────────────────────────────────────────────────────
    const playerHudY = 62;
    const cls = getClass(this.player.class);

    this.add.text(20, playerHudY, this.player.name.toUpperCase(), {
      fontSize: "14px",
      color: "#" + cls.color.toString(16).padStart(6, "0"),
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    this.add.text(20, playerHudY + 16, `Lv.${this.player.level} ${cls.name} — ${this.player.gold}g`, {
      fontSize: "10px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
    }).setOrigin(0, 0.5);

    this.add.rectangle(20 + 80, playerHudY + 34, 160, 10, 0x1a1a2e);
    this.playerHpBar = this.add.rectangle(20, playerHudY + 34, 160, 10, 0x27ae60).setOrigin(0, 0.5);
    this.playerHpText = this.add.text(20, playerHudY + 45, `HP ${this.player.health}/${this.player.maxHealth}`, {
      fontSize: "10px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
    }).setOrigin(0, 0);

    this.add.rectangle(20 + 80, playerHudY + 58, 160, 6, 0x1a1a2e);
    this.playerMpBar = this.add.rectangle(20, playerHudY + 58, 160, 6, 0x2980b9).setOrigin(0, 0.5);
    this.playerMpText = this.add.text(20, playerHudY + 64, `MP ${this.player.mp}/${this.player.maxMp}`, {
      fontSize: "9px",
      color: "#5d6d7e",
      fontFamily: "Georgia, serif",
    }).setOrigin(0, 0);

    // ── Sprites ──────────────────────────────────────────────────────────────
    this.playerSprite = this.add.graphics();
    this.drawPlayerSprite(this.playerSprite, 140, height * 0.48);

    this.demonSprite = this.add.graphics();
    this.drawDemonSprite(this.demonSprite, width - 140, height * 0.45);

    // ── Battle log ───────────────────────────────────────────────────────────
    const logY = height * 0.6;
    this.add.rectangle(width / 2, logY + 50, width - 40, 110, 0x0d0d18)
      .setStrokeStyle(1, 0x1a1a2e);
    this.battleLog = this.add.text(20, logY + 10, "", {
      fontSize: "12px",
      color: "#bdc3c7",
      fontFamily: "Georgia, serif",
      wordWrap: { width: width - 60 },
      lineSpacing: 4,
    });

    // ── Action buttons ───────────────────────────────────────────────────────
    this.buildActionButtons(width, height);

    // Initial log
    this.addLog(`${demon.name} emerges from the seal!`);
    this.addLog(`A ${demon.rank} — ${demon.description.split(".")[0]}.`);

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.updateUI();
  }

  // ─────────────────────────────────────────────────────────────────────────
  private buildActionButtons(width: number, height: number) {
    const cls = getClass(this.player.class);
    const btnY = height - 48;
    const btnW = 140;
    const btnH = 38;
    const actions = [
      { label: "Attack", color: 0xdc2626, key: "attack" },
      { label: cls.skills[0].name, color: 0x8e44ad, key: "skill0" },
      { label: cls.skills[1].name, color: 0x2980b9, key: "skill1" },
      { label: "Flee", color: 0x7f8c8d, key: "flee" },
    ];

    this.actionBtns = [];
    actions.forEach((action, i) => {
      const bx = 20 + i * (btnW + 8) + btnW / 2;
      const bg = this.add.rectangle(bx, btnY, btnW, btnH, 0x12121a).setInteractive({ cursor: "pointer" });
      const border = this.add.graphics();
      border.lineStyle(1, action.color, 0.6);
      border.strokeRect(bx - btnW / 2, btnY - btnH / 2, btnW, btnH);
      const txt = this.add.text(bx, btnY, action.label, {
        fontSize: "13px",
        color: "#" + action.color.toString(16).padStart(6, "0"),
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
      }).setOrigin(0.5);

      let sub: Phaser.GameObjects.Text | undefined;
      if (action.key.startsWith("skill")) {
        const idx = parseInt(action.key.slice(5));
        const skill = cls.skills[idx];
        sub = this.add.text(bx, btnY + 14, `MP:${skill.mpCost}`, {
          fontSize: "9px",
          color: "#5d6d7e",
          fontFamily: "Georgia, serif",
        }).setOrigin(0.5);
      }

      const container = this.add.container(0, 0, [bg, border, txt, ...(sub ? [sub] : [])]);
      this.actionBtns.push(container);

      bg.on("pointerover", () => {
        if (this.phase === "player-turn") bg.setFillStyle(0x1a0a2e);
      });
      bg.on("pointerout", () => bg.setFillStyle(0x12121a));
      bg.on("pointerdown", () => {
        if (this.phase !== "player-turn") return;
        this.handleAction(action.key as "attack" | "skill0" | "skill1" | "flee");
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  private handleAction(key: "attack" | "skill0" | "skill1" | "flee") {
    const cls = getClass(this.player.class);
    this.player.defendingThisTurn = false;
    this.phase = "animating";

    if (key === "flee") {
      this.addLog("You flee back to the surface...");
      this.time.delayedCall(1200, () => {
        this.cleanupAndGo("MainMenuScene", {});
      });
      return;
    }

    if (key === "attack") {
      const crit = this.player.buffNextAttack || Math.random() < (this.player.class === "rogue" ? 0.15 : 0.05);
      const dmg = this.calcDamage(
        this.player.attack * (crit ? 2 : 1),
        this.demonState.defense
      );
      this.player.buffNextAttack = false;

      this.animatePlayerAttack(() => {
        this.applyDamageToDemon(dmg);
        const critMsg = crit ? " CRITICAL HIT!" : "";
        this.addLog(`${this.player.name} strikes for ${dmg} damage.${critMsg}`);
        this.checkDemonDeath();
      });
      return;
    }

    if (key === "skill0" || key === "skill1") {
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
        const dmg = this.calcDamage(
          Math.floor(this.player.attack * skill.multiplier),
          this.demonState.defense
        );
        this.animatePlayerAttack(() => {
          this.applyDamageToDemon(dmg);
          this.addLog(`${this.player.name} uses ${skill.name} for ${dmg} damage!`);
          this.checkDemonDeath();
        });
      } else if (skill.effect === "heal") {
        const heal = Math.floor(this.player.maxHealth * skill.multiplier);
        this.player.health = Math.min(this.player.maxHealth, this.player.health + heal);
        this.addLog(`${this.player.name} uses ${skill.name}, restoring ${heal} HP!`);
        this.updateUI();
        this.time.delayedCall(800, () => this.demonAttack());
      } else if (skill.effect === "buff") {
        if (this.player.class === "rogue" && skill.name === "Vanish") {
          this.player.buffNextAttack = true;
          this.addLog(`${this.player.name} vanishes into shadow — next attack is guaranteed crit!`);
        } else {
          this.player.defendingThisTurn = true;
          this.addLog(`${this.player.name} activates ${skill.name}!`);
        }
        this.updateUI();
        this.time.delayedCall(800, () => this.demonAttack());
      }
      return;
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
    const abilityIdx = Math.floor(Math.random() * demon.abilities.length);
    const ability = demon.abilities[abilityIdx];
    const isSpecial = Math.random() < 0.25;

    const baseDmg = isSpecial
      ? Math.floor(this.demonState.attack * 1.6)
      : this.demonState.attack;
    const defFactor = this.player.defendingThisTurn ? 0.5 : 1;
    const dmg = Math.max(1, Math.floor(
      (baseDmg - this.player.defense / 2 + Phaser.Math.Between(-3, 3)) * defFactor
    ));

    this.animateDemonAttack(() => {
      this.player.health = Math.max(0, this.player.health - dmg);
      const specialMsg = isSpecial ? ` (${ability}!)` : "";
      this.addLog(`${demon.name} attacks for ${dmg} damage!${specialMsg}`);

      // Reduce cooldowns
      this.player.skillCooldowns = this.player.skillCooldowns.map((cd) => Math.max(0, cd - 1));
      // Regen MP
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + 5);

      this.updateUI();
      if (this.player.health <= 0) {
        this.phase = "defeat";
        this.handleDefeat();
      } else {
        this.phase = "player-turn";
      }
    });
  }

  private handleVictory() {
    const dStats = getDemonStats(this.demonState.demon, this.player.floor);
    const xpGained = dStats.xpReward;
    const goldGained = dStats.goldReward;

    this.player.experience += xpGained;
    this.player.gold += goldGained;
    this.player.floor++;

    this.addLog(`Victory! Gained ${xpGained} XP and ${goldGained} gold.`);

    // Level up check
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
      this.player.mp = this.player.maxMp;
      this.addLog(`★ LEVEL UP! You are now level ${this.player.level}!`);
      this.phase = "level-up";
    }

    if (this.player.floor > 72) {
      // Won the game!
      this.time.delayedCall(1500, () => {
        this.cleanupAndGo("VictoryScene", { player: this.player });
      });
      return;
    }

    this.time.delayedCall(1800, () => {
      this.showVictoryOverlay();
    });
  }

  private showVictoryOverlay() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(20);

    this.add.text(width / 2, height / 2 - 50, "Demon Sealed!", {
      fontSize: "28px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(21);

    this.add.text(width / 2, height / 2 - 10, `Floor ${this.player.floor - 1} cleared`, {
      fontSize: "16px",
      color: "#9b59b6",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setDepth(21);

    this.add.text(width / 2, height / 2 + 20, `Next: Floor ${this.player.floor} — ${getDemon(this.player.floor).name}`, {
      fontSize: "13px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setDepth(21);

    const continueBtn = this.add.rectangle(width / 2, height / 2 + 65, 200, 42, 0x1a0a2e)
      .setDepth(21).setInteractive({ cursor: "pointer" });
    this.add.graphics().setDepth(21).lineStyle(2, 0xc9a227, 1)
      .strokeRect(width / 2 - 100, height / 2 + 65 - 21, 200, 42);
    const contTxt = this.add.text(width / 2, height / 2 + 65, "Descend Further", {
      fontSize: "15px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setDepth(22);

    continueBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.restart({ playerState: this.player });
      });
    });
  }

  private handleDefeat() {
    const { width, height } = this.scale;
    this.addLog("You have fallen in the Abyss...");

    this.time.delayedCall(1200, () => {
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(20);
      this.add.text(width / 2, height / 2 - 50, "DEFEATED", {
        fontSize: "40px",
        color: "#dc2626",
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(21);

      this.add.text(width / 2, height / 2, `You reached Floor ${this.player.floor}`, {
        fontSize: "18px",
        color: "#7f8c8d",
        fontFamily: "Georgia, serif",
      }).setOrigin(0.5).setDepth(21);

      this.add.text(width / 2, height / 2 + 30, `Level ${this.player.level} ${getClass(this.player.class).name}`, {
        fontSize: "14px",
        color: "#5d6d7e",
        fontFamily: "Georgia, serif",
      }).setOrigin(0.5).setDepth(21);

      const menuBtn = this.add.rectangle(width / 2, height / 2 + 80, 200, 42, 0x1a0a2e)
        .setDepth(21).setInteractive({ cursor: "pointer" });
      this.add.graphics().setDepth(21).lineStyle(2, 0xdc2626, 1)
        .strokeRect(width / 2 - 100, height / 2 + 80 - 21, 200, 42);
      this.add.text(width / 2, height / 2 + 80, "Return to Menu", {
        fontSize: "15px",
        color: "#dc2626",
        fontFamily: "Georgia, serif",
      }).setOrigin(0.5).setDepth(22);

      menuBtn.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.cleanupAndGo("MainMenuScene", {});
        });
      });
    });
  }

  // ─── Animations ──────────────────────────────────────────────────────────
  private animatePlayerAttack(onHit: () => void) {
    const origX = 140;
    this.tweens.add({
      targets: this.playerSprite,
      x: 80,
      duration: 100,
      yoyo: false,
      onComplete: () => {
        this.tweens.add({
          targets: this.playerSprite,
          x: origX,
          duration: 200,
          onComplete: () => {
            onHit();
          },
        });
      },
    });
    // Flash demon
    this.time.delayedCall(100, () => {
      this.tweens.add({
        targets: this.demonSprite,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 1,
      });
    });
  }

  private animateDemonAttack(onHit: () => void) {
    const { width } = this.scale;
    const origX = width - 140;
    this.tweens.add({
      targets: this.demonSprite,
      x: origX - 80,
      duration: 100,
      onComplete: () => {
        this.tweens.add({
          targets: this.demonSprite,
          x: origX,
          duration: 200,
          onComplete: () => {
            onHit();
          },
        });
      },
    });
    this.time.delayedCall(100, () => {
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 1,
      });
    });
  }

  // ─── Drawing ─────────────────────────────────────────────────────────────
  private drawPlayerSprite(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.x = x;
    g.y = y;
    g.clear();

    const cls = getClass(this.player.class);
    const c = cls.color;

    // Body
    g.fillStyle(c, 0.8);
    g.fillRect(-18, -50, 36, 50);

    // Head
    g.fillStyle(c, 1);
    g.fillCircle(0, -62, 16);

    // Class detail
    g.lineStyle(2, 0xffffff, 0.4);
    switch (this.player.class) {
      case "warrior":
        g.fillStyle(0xaaaaaa, 0.9);
        g.fillRect(-4, -75, 8, 30); // sword
        g.fillRect(-12, -55, 24, 6); // crossguard
        break;
      case "mage":
        g.fillStyle(0xaa44ff, 0.9);
        g.fillCircle(0, -80, 8); // orb
        break;
      case "rogue":
        g.fillStyle(0x44aa66, 0.9);
        g.fillRect(-4, -72, 6, 22); // dagger
        break;
      case "cleric":
        g.lineStyle(2, 0xffdd44, 0.9);
        g.lineBetween(-10, -70, 10, -70); // cross
        g.lineBetween(0, -78, 0, -62);
        break;
    }

    // HP tint
    const hpRatio = this.player.health / this.player.maxHealth;
    if (hpRatio < 0.3) {
      g.fillStyle(0xff0000, 0.2);
      g.fillRect(-18, -50, 36, 50);
    }
  }

  private drawDemonSprite(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.x = x;
    g.y = y;
    g.clear();

    const demon = this.demonState.demon;
    const c = demon.color;
    const gc = demon.glowColor;

    // Glow aura
    g.fillStyle(gc, 0.08);
    g.fillCircle(0, -40, 70);

    // Body (more monstrous shape)
    g.fillStyle(c, 0.9);
    g.fillTriangle(-30, 0, 30, 0, 0, -80);

    // Core body
    g.fillStyle(c, 1);
    g.fillRect(-22, -55, 44, 55);

    // Eyes
    g.fillStyle(gc, 1);
    g.fillCircle(-8, -65, 5);
    g.fillCircle(8, -65, 5);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-8, -65, 2);
    g.fillCircle(8, -65, 2);

    // Horns
    g.lineStyle(3, gc, 0.9);
    g.beginPath();
    g.moveTo(-10, -80);
    g.lineTo(-20, -100);
    g.strokePath();
    g.beginPath();
    g.moveTo(10, -80);
    g.lineTo(20, -100);
    g.strokePath();

    // HP indicator
    const hpRatio = this.demonState.health / this.demonState.maxHealth;
    if (hpRatio < 0.3) {
      g.fillStyle(0xff0000, 0.15);
      g.fillCircle(0, -40, 70);
    }
  }

  // ─── UI Updates ──────────────────────────────────────────────────────────
  private updateUI() {
    const playerHpRatio = this.player.health / this.player.maxHealth;
    const playerMpRatio = this.player.mp / this.player.maxMp;
    const demonHpRatio = this.demonState.health / this.demonState.maxHealth;

    this.playerHpBar.width = 160 * playerHpRatio;
    this.playerHpBar.setFillStyle(playerHpRatio > 0.5 ? 0x27ae60 : playerHpRatio > 0.25 ? 0xe67e22 : 0xdc2626);
    this.playerHpText.setText(`HP ${this.player.health}/${this.player.maxHealth}`);

    this.playerMpBar.width = 160 * playerMpRatio;
    this.playerMpText.setText(`MP ${this.player.mp}/${this.player.maxMp}`);

    this.demonHpBar.width = 160 * Math.max(0, demonHpRatio);
    this.demonHpText.setText(`${this.demonState.health}/${this.demonState.maxHealth}`);

    // Redraw sprites with updated state
    const { height, width } = this.scale;
    this.drawPlayerSprite(this.playerSprite, 140, height * 0.48);
    this.drawDemonSprite(this.demonSprite, width - 140, height * 0.45);
  }

  private addLog(message: string) {
    this.logMessages.push(message);
    if (this.logMessages.length > 5) this.logMessages.shift();
    this.battleLog.setText(this.logMessages.join("\n"));
  }

  private calcDamage(attack: number, defense: number): number {
    const variance = Phaser.Math.Between(-4, 4);
    return Math.max(1, Math.floor(attack - defense / 2 + variance));
  }

  private applyDamageToDemon(dmg: number) {
    this.demonState.health = Math.max(0, this.demonState.health - dmg);
  }

  private cleanupAndGo(scene: string, data: object) {
    this.scene.start(scene, data);
  }
}
