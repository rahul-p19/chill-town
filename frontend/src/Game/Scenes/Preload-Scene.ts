import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";

export class PreloadScene extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }
  preload() {
    this.load.pack("mainpack", "assets/data/assets.json");
  }
  create() {
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }
  update() {
  }
}
