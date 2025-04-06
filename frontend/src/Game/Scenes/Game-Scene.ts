import { SCENE_KEYS } from "./SceneKeys";
import { Player } from "../game-objects/Players/player";
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from "../common/assets";
import { KeyboardComponent } from "../components/input/keyboard-component";
import { Room } from "../game-objects/Rooms/room";

import { Client, Room as ColyseusRoom } from "colyseus.js";


export class GameScene extends Phaser.Scene {
  #player!: Player;
  #controls!: KeyboardComponent;
  #roomGroup!: Phaser.GameObjects.Group;
  #client!: Client;
  #gameRoom: ColyseusRoom | null = null;
  #otherPlayers: Map<string, Player> = new Map();
  #lastSentX: number = 0;
  #lastSentY: number = 0;
  #lastSentAnimation: string | undefined;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  preload() {
    console.log("game loaded")
    this.load.image("botany", "assets/world/botanic.png");
    this.load.image("room", "assets/world/truck.png");
    this.load.tilemapTiledJSON("map", "tiled/mail-tile.json");
    console.log("game loaded");
  }

  async create() {
    if (!this.input.keyboard) {
      console.error("Keyboard input not available");
      return;
    }

    this.#client = new Client("ws://localhost:2567");

    try {
      this.#gameRoom = await this.#client.joinOrCreate("my_room");
      console.log("Connected to room:", this.#gameRoom.sessionId);
      //this.setupRoomHandlers();
      this.initializeGameObjects();
    } catch (error) {
      console.error("Failed to connect to Colyseus server:", error);
      this.initializeGameObjects();
    }
  }

  setupRoomHandlers() {
    if (!this.#gameRoom) return;
    this.#gameRoom.onStateChange((state) => {
      console.log("Room state updated:", state);

      if (state.players) {
        state.players.forEach((player: any, sessionId: string) => {
          if (sessionId === this.#gameRoom?.sessionId) return;

          if (!this.#otherPlayers.has(sessionId)) {
            const otherPlayer = new Player({
              controls: new KeyboardComponent(this.input.keyboard!),
              scene: this,
              position: { x: player.x || 100, y: player.y || 100 },
              texture: ASSET_KEYS.PLAYER,
              frame: 0,
            });

            this.#otherPlayers.set(sessionId, otherPlayer);
          } else {
            const otherPlayer = this.#otherPlayers.get(sessionId);
            if (otherPlayer) {
              otherPlayer.setPosition(
                player.x || otherPlayer.x,
                player.y || otherPlayer.y
              );

              if (player.animation) {
                otherPlayer.playAnimation(player.animation);
              }
            }
          }
        });

        this.#otherPlayers.forEach((player, sessionId) => {
          if (!state.players.has(sessionId)) {
            player.destroy();
            this.#otherPlayers.delete(sessionId);
          }
        });
      }
    });

    this.#gameRoom.onMessage("playerJoined", (message) => {
      console.log("Player joined:", message);
    });

    this.#gameRoom.onMessage("playerLeft", (message) => {
      console.log("Player left:", message);
    });

    this.#gameRoom.onMessage("updatePosition", (message) => {
      if (
        message.sessionId &&
        message.sessionId !== this.#gameRoom?.sessionId
      ) {
        const otherPlayer = this.#otherPlayers.get(message.sessionId);
        if (otherPlayer) {
          otherPlayer.setPosition(message.x, message.y);
          if (message.animation) {
            otherPlayer.playAnimation(message.animation);
          }
        }
      }
    });

    this.#gameRoom.onLeave((code) => {
      console.log("Left room:", code);
      this.#gameRoom = null;
    });
  }

  initializeGameObjects() {
    this.#controls = new KeyboardComponent(this.input.keyboard!);

    this.#player = new Player({
      controls: this.#controls,
      scene: this,
      position: { x: 100, y: 100 },
      texture: ASSET_KEYS.PLAYER,
      frame: 0,
      gameRoom: this.#gameRoom || undefined,
    });
    const map = this.make.tilemap({ key: 'map' });
    const botanyTileSet = map.addTilesetImage('botany', 'botany')
    const roomTileSet = map.addTilesetImage('truck', 'room')

    const background = map.createLayer('background', botanyTileSet!);
    const rocks = map.createLayer('rocks', botanyTileSet!);
    const trees = map.createLayer('trees', botanyTileSet!);
    const decorations = map.createLayer('decorations', roomTileSet!);
    const collision = map.createLayer('collision-map', botanyTileSet!);
    if (!collision) {
      return;
    }


    this.#player.setDepth(10);

    this.#roomGroup = this.physics.add.group([
      new Room({
        scene: this,
        position: { x: this.scale.width / 2, y: this.scale.height / 2 },
        texture: ASSET_KEYS.ROOM,
      }),
    ]);

    this.setAnimations();
    this.#registerColliders();
    collision.setCollision([28]);
    this.physics.add.collider(this.#player, collision);
  }

  #registerColliders() {
    this.#player.setCollideWorldBounds(true);
    this.#roomGroup.getChildren().forEach((room) => {
      const modifiedRoom = room as Phaser.Physics.Arcade.Image;
      modifiedRoom.setImmovable(true);
      modifiedRoom.setCollideWorldBounds(true);

    })
    this.physics.add.collider(this.#player, this.#roomGroup, (player: any, room: any) => {
      window.location.href = "room/test"
    });

    this.physics.add.collider(
      this.#player,
      this.#roomGroup,
      (player: any, room: any) => {
        console.log("hit");

        if (this.#gameRoom) {
          this.#gameRoom.send("roomCollision", {
            roomId: room.getData("id") || "unknown",
            playerPosition: { x: player.x, y: player.y },
          });
        }
      }
    );

    this.#otherPlayers.forEach((otherPlayer) => {
      otherPlayer.setCollideWorldBounds(true);
      this.physics.add.collider(otherPlayer, this.#roomGroup);
      this.physics.add.collider(this.#player, otherPlayer);
    });
  }

  setAnimations() {
    let rep = 1;
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_DOWN,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 0,
        end: 0,
      }),
      frameRate: 8,
      repeat: 1,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_LEFT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 3,
        end: 3,
      }),
      frameRate: 8,
      repeat: 1,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_UP,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 6,
        end: 6,
      }),
      frameRate: 8,
      repeat: 1,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_RIGHT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 9,
        end: 9,
      }),
      frameRate: 8,
      repeat: 1,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_DOWN,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 1,
        end: 2,
      }),
      frameRate: 8,
      repeat: rep,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_LEFT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 4,
        end: 5,
      }),
      frameRate: 8,
      repeat: rep,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_UP,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 7,
        end: 8,
      }),
      frameRate: 8,
      repeat: rep,
    });
    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_RIGHT,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.PLAYER, {
        start: 10,
        end: 11,
      }),
      frameRate: 8,
      repeat: rep,
    });
  }

  update() {
    if (this.#otherPlayers.size > 0) {
      this.#otherPlayers.forEach((otherPlayer) => {
        if (!otherPlayer.body) {
          this.physics.add.existing(otherPlayer);
          otherPlayer.setCollideWorldBounds(true);
          this.physics.add.collider(otherPlayer, this.#roomGroup);
          this.physics.add.collider(this.#player, otherPlayer);
        }
      });
    }

    if (this.#gameRoom && this.#player) {
      const currentAnim = this.#player.anims.currentAnim?.key;
      const moved =
        this.#player.x !== this.#lastSentX ||
        this.#player.y !== this.#lastSentY ||
        currentAnim !== this.#lastSentAnimation;

      if (moved) {
        this.#gameRoom.send("updatePosition", {
          x: this.#player.x,
          y: this.#player.y,
          animation: currentAnim,
        });

        this.#lastSentX = this.#player.x;
        this.#lastSentY = this.#player.y;
        this.#lastSentAnimation = currentAnim;
      }
    }
  }

  shutdown() {
    if (this.#gameRoom) {
      this.#gameRoom.leave();
      this.#gameRoom = null;
    }
  }
}

