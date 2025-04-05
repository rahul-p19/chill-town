import { SCENE_KEYS } from "./SceneKeys";
import { Player } from "../game-objects/Players/player";
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from "../common/assets";
import { KeyboardComponent } from "../components/input/keyboard-component";
import { Room } from "../game-objects/Rooms/room";
import { register } from "module";

export class GameScene extends Phaser.Scene {
  #player!: Player;
  #controls !: KeyboardComponent;
  #roomGroup !: Phaser.GameObjects.Group;
  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE
    });
  }
  preload() {
    console.log("game loaded")
    this.load.image("botany", "assets/world/botanic.png");
    this.load.image("room", "assets/world/truck.png");
    this.load.tilemapTiledJSON("map", "tiled/mail-tile.json");
  }
  create() {
    if (!this.input.keyboard) {
      console.error("Keyboard input not available");
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);
    this.#player = new Player({
      controls: this.#controls,
      scene: this,
      position: { x: 100, y: 100 },
      texture: ASSET_KEYS.PLAYER,
      frame: 0
    });
    const map = this.make.tilemap({ key: 'map' });
    const botanyTileSet = map.addTilesetImage('botany', 'botany')
    const roomTileSet = map.addTilesetImage('truck', 'room')

    const background = map.createLayer('background', botanyTileSet);
    const rocks = map.createLayer('rocks', botanyTileSet);
    const trees = map.createLayer('trees', botanyTileSet);
    const decorations = map.createLayer('decorations', roomTileSet);
    const collision = map.createLayer('collision-map', botanyTileSet);
    if (!collision) {
      return;
    }


    this.#player.setDepth(10);

    this.#roomGroup = this.physics.add.group([
      new Room({
        scene: this,
        position: { x: this.scale.width / 2, y: this.scale.height / 2 },
        texture: ASSET_KEYS.ROOM,
      })
    ]);
    this.setAnimations();
    this.#registerColliders();
    collision.setCollision([28]);
    this.physics.add.collider(this.#player, collision);
  }
  #registerColliders() {
    this.#player.setCollideWorldBounds(true);
    this.#roomGroup.getChildren().forEach(room => {
      const modifiedRoom = room as Phaser.Physics.Arcade.Image;
      modifiedRoom.setImmovable(true);
      modifiedRoom.setCollideWorldBounds(true);
    })
    this.physics.add.collider(this.#player, this.#roomGroup, (player: any, room: any) => {
      console.log("hit")
    });
  }
  setAnimations() {
    let rep = 1;
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_DOWN,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 0, end: 0 }),
      frameRate: 8,
      repeat: 1,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_LEFT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 3, end: 3 }),
      frameRate: 8,
      repeat: 1,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_UP,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 6, end: 6 }),
      frameRate: 8,
      repeat: 1,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_RIGHT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 9, end: 9 }),
      frameRate: 8,
      repeat: 1,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_DOWN,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 1, end: 2 }),
      frameRate: 8,
      repeat: rep,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_LEFT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 4, end: 5 }),
      frameRate: 8,
      repeat: rep,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_UP,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 7, end: 8 }),
      frameRate: 8,
      repeat: rep,
    })
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_RIGHT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, { start: 10, end: 11 }),
      frameRate: 8,
      repeat: rep,
    })

  }

}
