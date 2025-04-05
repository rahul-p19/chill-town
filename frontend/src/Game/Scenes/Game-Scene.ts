import { SCENE_KEYS } from "./SceneKeys";
import { Player } from "../game-objects/Players/player";
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from "../common/assets";

export class GameScene extends Phaser.Scene {
  #player!: Player;
  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE
    });
  }
  preload() {
    console.log("game loaded")
  }
  create() {
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_DOWN,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 1, end: 2 }),
      frameRate: 8,
      repeat: 5,
    })
    console.log(this.physics);
    this.#player = new Player({
      scene: this,
      position: { x: 100, y: 100 },
      texture: ASSET_KEYS.PLAYER,
      frame: 0
    });
    this.#player.playAnimation("down-walk");
  }
  update() {
  }
}
