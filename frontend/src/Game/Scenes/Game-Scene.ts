import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";

export class GameScene extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE
    });
  }
  preload() {
    console.log("game loaded")
  }
  create() {
    this.add.sprite(this.scale.width / 2, this.scale.height / 2, "basic-male-player", 0);
  }
  update() {
  }
}
