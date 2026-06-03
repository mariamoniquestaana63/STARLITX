import Phaser from "phaser";

interface LeaderboardEntry {
  username: string;
  character_name: string;
  class: string;
  level: number;
  current_floor: number;
  demons_slain: number;
}

export class LeaderboardScene extends Phaser.Scene {
  private entries: LeaderboardEntry[] = [];
  private rowContainer!: Phaser.GameObjects.Container;
  private liveDot!: Phaser.GameObjects.Arc;

  constructor() {
    super({ key: "LeaderboardScene" });
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    // Stars
    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width), Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.1, 0.5)
      );
      this.tweens.add({ targets: star, alpha: 0.05, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }

    this.add.text(width / 2, 28, "Hall of Abyssal Warriors", {
      fontSize: "24px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, 54, "Those who dared descend into Solomon's Abyss", {
      fontSize: "12px", color: "#7f8c8d", fontFamily: "Georgia, serif", fontStyle: "italic",
    }).setOrigin(0.5);

    // Live badge
    this.liveDot = this.add.circle(width - 72, 28, 5, 0xdc2626);
    this.add.text(width - 62, 28, "LIVE", {
      fontSize: "11px", color: "#dc2626", fontFamily: "Georgia, serif", fontStyle: "bold",
    }).setOrigin(0, 0.5);
    this.tweens.add({ targets: this.liveDot, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    // Table header
    const headerY = 80;
    const cols = [50, 180, 310, 400, 490, 590];
    const headers = ["#", "Warrior", "Class", "Level", "Floor", "Demons"];
    headers.forEach((h, i) => {
      this.add.text(cols[i], headerY, h, {
        fontSize: "11px", color: "#c9a227", fontFamily: "Georgia, serif", fontStyle: "bold",
      });
    });
    const divG = this.add.graphics();
    divG.lineStyle(1, 0x2a1a3a, 1);
    divG.lineBetween(30, headerY + 16, width - 30, headerY + 16);

    // Row container (updated on live refresh)
    this.rowContainer = this.add.container(0, 0);

    // Loading
    const loadTxt = this.add.text(width / 2, height / 2, "Consulting the seals...", {
      fontSize: "16px", color: "#6c3483", fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    // Initial fetch
    this.game.events.emit("fetchLeaderboard", (data: LeaderboardEntry[]) => {
      loadTxt.destroy();
      this.entries = data || [];
      this.renderRows(cols, width);
    });

    // Live update listener
    this.game.events.on("leaderboardUpdate", (data: LeaderboardEntry[]) => {
      this.entries = data;
      this.rowContainer.removeAll(true);
      this.renderRows(cols, width);
      this.flashLive();
    }, this);

    // Poll every 15s
    this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: () => {
        this.game.events.emit("fetchLeaderboard", (data: LeaderboardEntry[]) => {
          if (!data) return;
          this.entries = data;
          this.rowContainer.removeAll(true);
          this.renderRows(cols, width);
          this.flashLive();
        });
      },
    });

    // Back button
    const back = this.add.text(60, 28, "← Back", {
      fontSize: "14px", color: "#6c3483", fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });
    back.on("pointerover", () => back.setColor("#9b59b6"));
    back.on("pointerout", () => back.setColor("#6c3483"));
    back.on("pointerdown", () => this.scene.start("MainMenuScene"));

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private renderRows(cols: number[], width: number) {
    const { height } = this.scale;

    if (!this.entries || this.entries.length === 0) {
      const empty = this.add.text(width / 2, height / 2, "No warriors have descended yet.\nBe the first!", {
        fontSize: "16px", color: "#7f8c8d", fontFamily: "Georgia, serif", align: "center",
      }).setOrigin(0.5);
      this.rowContainer.add(empty);
      return;
    }

    const classColors: Record<string, string> = {
      warrior: "#e67e22", mage: "#9b59b6", rogue: "#27ae60", cleric: "#f1c40f",
    };

    this.entries.slice(0, 14).forEach((entry, i) => {
      const rowY = 102 + i * 26;
      const rankColor = i === 0 ? "#c9a227" : i === 1 ? "#95a5a6" : i === 2 ? "#e67e22" : "#7f8c8d";

      // Highlight row for top 3
      if (i < 3) {
        const rowBg = this.add.rectangle(width / 2, rowY + 8, width - 60, 22, 0x1a0a2e, 0.4);
        this.rowContainer.add(rowBg);
      }

      const medal = i === 0 ? "♔ " : i === 1 ? "♕ " : i === 2 ? "♖ " : "";
      const cells = [
        { x: cols[0], t: `${i + 1}`, color: rankColor },
        { x: cols[1], t: `${medal}${entry.character_name}`, color: "#ecf0f1" },
        { x: cols[2], t: entry.class, color: classColors[entry.class] ?? "#7f8c8d" },
        { x: cols[3], t: `${entry.level}`, color: "#3498db" },
        { x: cols[4], t: `${entry.current_floor}`, color: "#27ae60" },
        { x: cols[5], t: `${entry.demons_slain}`, color: "#e74c3c" },
      ];

      cells.forEach(({ x, t, color }) => {
        const txt = this.add.text(x, rowY, t, { fontSize: "12px", color, fontFamily: "Georgia, serif" });
        this.rowContainer.add(txt);
      });

      // Username (small, below character name)
      const user = this.add.text(cols[1], rowY + 13, `@${entry.username}`, {
        fontSize: "9px", color: "#5d6d7e", fontFamily: "Georgia, serif",
      });
      this.rowContainer.add(user);
    });
  }

  private flashLive() {
    this.tweens.add({
      targets: this.liveDot,
      scaleX: { from: 1, to: 2 },
      scaleY: { from: 1, to: 2 },
      alpha: { from: 1, to: 0.2 },
      duration: 400,
      yoyo: true,
    });
  }

  shutdown() {
    this.game.events.off("leaderboardUpdate", undefined, this);
  }
}
