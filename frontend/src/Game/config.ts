import { GameScene } from "./Scenes/Game-Scene";
import { PreloadScene } from "./Scenes/Preload-Scene";

export const GameConfiguration: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-content',
  height: 720,
  width: 1080,
  title: "chill-town",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, GameScene]
}
