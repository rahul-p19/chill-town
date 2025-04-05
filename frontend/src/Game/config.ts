import { GameScene } from "./Scenes/Game-Scene";
import { PreloadScene } from "./Scenes/Preload-Scene";

export const GameConfiguration: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-content',
  height: 720,
  width: 1080,
  title: "chill-town",
  scene: [PreloadScene, GameScene]
}
