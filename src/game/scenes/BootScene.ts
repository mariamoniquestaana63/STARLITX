import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // All graphics are programmatic — nothing to preload
    const { width, height } = this.scale;

    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);
    bg.setDepth(0);

    const loadText = this.add.text(width / 2, height / 2, "Loading Solomon's Abyss...", {
      fontSize: "20px",
      color: "#c9a227",
      fontFamily: "Georgia, serif",
    }).setOrigin(0.5);

    const bar = this.add.rectangle(width / 2, height / 2 + 40, 300, 8, 0x2a1a3a);
    const fill = this.add.rectangle(width / 2 - 150, height / 2 + 40, 0, 8, 0xc9a227);
    fill.setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      fill.width = 300 * value;
    });

    this.load.on("complete", () => {
      loadText.destroy();
      bar.destroy();
      fill.destroy();
    });
  }

  create() {
    this.scene.start("MainMenuScene");
  }
}
