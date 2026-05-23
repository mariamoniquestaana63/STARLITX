import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Arc[] = [];
  private titleGlow = 0;

  constructor() {
    super({ key: "MainMenuScene" });
  }

  create() {
    const { width, height } = this.scale;

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    // Starfield
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const star = this.add.circle(x, y, r, 0xffffff, alpha);
      this.stars.push(star);
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.2 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Decorative pentagram
    const pentagram = this.add.graphics();
    this.drawPentagram(pentagram, width / 2, height / 2 - 40, 180);
    this.tweens.add({
      targets: pentagram,
      angle: 360,
      duration: 30000,
      repeat: -1,
    });

    // Title
    const titleShadow = this.add.text(width / 2 + 3, 83, "STARLITX", {
      fontSize: "72px",
      color: "#3d0a4f",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, 80, "STARLITX", {
      fontSize: "72px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    const subtitle = this.add.text(width / 2, 145, "Solomon's Abyss", {
      fontSize: "22px",
      color: "#9b59b6",
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    }).setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0xc9a227, 0.4);
    divider.lineBetween(width / 2 - 180, 168, width / 2 + 180, 168);

    const tagline = this.add.text(width / 2, 188, "72 Demons. 4 Classes. One Abyss.", {
      fontSize: "14px",
      color: "#7f8c8d",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    // Play button
    const btnY = height - 160;
    const btn = this.add.rectangle(width / 2, btnY, 260, 52, 0x1a0a2e)
      .setInteractive({ cursor: "pointer" });
    const btnBorder = this.add.graphics();
    btnBorder.lineStyle(2, 0xc9a227, 1);
    btnBorder.strokeRect(width / 2 - 130, btnY - 26, 260, 52);

    const btnText = this.add.text(width / 2, btnY, "ENTER THE ABYSS", {
      fontSize: "18px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    btn.on("pointerover", () => {
      btn.setFillStyle(0x2d1050);
      btnText.setColor("#ffffff");
    });
    btn.on("pointerout", () => {
      btn.setFillStyle(0x1a0a2e);
      btnText.setColor("#c9a227");
    });
    btn.on("pointerdown", () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("CharacterSelectScene");
      });
    });

    // Leaderboard button
    const lbBtn = this.add.text(width / 2, btnY + 60, "View Leaderboard", {
      fontSize: "14px",
      color: "#6c3483",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });
    lbBtn.on("pointerover", () => lbBtn.setColor("#9b59b6"));
    lbBtn.on("pointerout", () => lbBtn.setColor("#6c3483"));
    lbBtn.on("pointerdown", () => this.scene.start("LeaderboardScene"));

    // Version text
    this.add.text(width - 10, height - 10, "v0.1.0 — Alpha", {
      fontSize: "11px",
      color: "#3d3d4f",
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(800, 0, 0, 0);
  }

  private drawPentagram(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number) {
    g.lineStyle(1, 0x3d0a4f, 0.25);
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const next = (i + 2) % 5;
      g.moveTo(points[i].x, points[i].y);
      g.lineTo(points[next].x, points[next].y);
    }
    // Outer circle
    g.strokeCircle(cx, cy, r);
    g.strokePath();

    // Inner circle
    g.lineStyle(1, 0x2a1a3a, 0.2);
    g.strokeCircle(cx, cy, r * 0.618);
  }
}
