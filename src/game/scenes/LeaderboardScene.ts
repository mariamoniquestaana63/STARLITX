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
  constructor() {
    super({ key: "LeaderboardScene" });
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    this.add.text(width / 2, 35, "Hall of Abyssal Warriors", {
      fontSize: "26px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, 60, "Those who dared descend into Solomon's Abyss", {
      fontSize: "12px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    }).setOrigin(0.5);

    // Loading text while we fetch
    const loadingTxt = this.add.text(width / 2, height / 2, "Consulting the seals...", {
      fontSize: "16px",
      color: "#6c3483",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    // Fetch from Supabase via the game's event emitter
    this.game.events.emit("fetchLeaderboard", (entries: LeaderboardEntry[]) => {
      loadingTxt.destroy();
      this.renderLeaderboard(entries, width, height);
    });

    // Fallback timeout
    this.time.delayedCall(5000, () => {
      if (loadingTxt.active) {
        loadingTxt.setText("The seals are silent...");
      }
    });

    // Back button
    const back = this.add.text(60, 35, "← Back", {
      fontSize: "14px",
      color: "#6c3483",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });
    back.on("pointerover", () => back.setColor("#9b59b6"));
    back.on("pointerout", () => back.setColor("#6c3483"));
    back.on("pointerdown", () => this.scene.start("MainMenuScene"));

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private renderLeaderboard(entries: LeaderboardEntry[], width: number, height: number) {
    if (!entries || entries.length === 0) {
      this.add.text(width / 2, height / 2, "No warriors have descended yet.\nBe the first!", {
        fontSize: "16px",
        color: "#7f8c8d",
        fontFamily: "Georgia, serif",
        align: "center",
      }).setOrigin(0.5);
      return;
    }

    // Header row
    const headerY = 90;
    const cols = [60, 200, 320, 430, 540, 650];
    const headers = ["#", "Warrior", "Class", "Level", "Floor", "Demons"];
    headers.forEach((h, i) => {
      this.add.text(cols[i], headerY, h, {
        fontSize: "11px",
        color: "#c9a227",
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
      });
    });

    const divG = this.add.graphics();
    divG.lineStyle(1, 0x2a1a3a, 1);
    divG.lineBetween(40, headerY + 18, width - 40, headerY + 18);

    entries.slice(0, 12).forEach((entry, i) => {
      const rowY = headerY + 30 + i * 28;
      const rankColor = i === 0 ? "#c9a227" : i === 1 ? "#95a5a6" : i === 2 ? "#e67e22" : "#7f8c8d";

      this.add.text(cols[0], rowY, `${i + 1}`, { fontSize: "13px", color: rankColor, fontFamily: "Georgia, serif" });
      this.add.text(cols[1], rowY, entry.character_name, { fontSize: "13px", color: "#ecf0f1", fontFamily: "Georgia, serif" });
      this.add.text(cols[2], rowY, entry.class, { fontSize: "12px", color: "#9b59b6", fontFamily: "Georgia, serif" });
      this.add.text(cols[3], rowY, `${entry.level}`, { fontSize: "13px", color: "#3498db", fontFamily: "Georgia, serif" });
      this.add.text(cols[4], rowY, `${entry.current_floor}`, { fontSize: "13px", color: "#27ae60", fontFamily: "Georgia, serif" });
      this.add.text(cols[5], rowY, `${entry.demons_slain}`, { fontSize: "13px", color: "#e74c3c", fontFamily: "Georgia, serif" });
    });
  }
}
