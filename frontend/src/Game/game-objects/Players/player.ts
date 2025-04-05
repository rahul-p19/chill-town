import { PLAYER_ANIMATION_KEYS } from "@/Game/common/assets";
import { DIRECTIONS, Position } from "@/Game/common/types";
import { isPhysicsArcadeBody } from "@/Game/common/utils";
import { KeyboardComponent } from "@/Game/components/input/keyboard-component";
import { Client, Room as ColyseusRoom } from "colyseus.js";

export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position;
  texture: string;
  controls: KeyboardComponent;
  frame?: string | number;
  gameRoom?: ColyseusRoom;
};
export class Player extends Phaser.Physics.Arcade.Sprite {
  #controls!: KeyboardComponent;
  #direction!: DIRECTIONS;
  // private gameRoom?: ColyseusRoom;

  constructor(config: PlayerConfig) {
    const {
      scene,
      position: { x, y },
      texture,
      frame,
      controls,
    } = config;
    super(scene, x, y, texture, frame || 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.#controls = controls;

    scene.events.on("update", this.update, this);
    scene.events.on(
      "shutdown",
      () => {
        scene.events.off("update", this.update, this);
      },
      this
    );
    this.#direction = DIRECTIONS.DOWN;
    this.play({ key: PLAYER_ANIMATION_KEYS.IDLE_DOWN }, true);
  }

  playAnimation(animationKey: string) {
    this.play({ key: animationKey, repeat: -1 }, true);
  }

  update() {
    const controls = this.#controls;

    if (controls.isUpDown) {
      this.playAnimation(PLAYER_ANIMATION_KEYS.WALK_UP);
      this.#direction = DIRECTIONS.UP;
      this.#updateVelocity(false, -100);
    } else if (controls.isDownDown) {
      this.playAnimation(PLAYER_ANIMATION_KEYS.WALK_DOWN);
      this.#direction = DIRECTIONS.DOWN;
      this.#updateVelocity(false, 100);
    } else {
      this.#updateVelocity(false, 0);
    }

    if (controls.isRightDown) {
      this.playAnimation(PLAYER_ANIMATION_KEYS.WALK_RIGHT);
      this.#direction = DIRECTIONS.RIGHT;
      this.#updateVelocity(true, 100);
    } else if (controls.isLeftDown) {
      this.playAnimation(PLAYER_ANIMATION_KEYS.WALK_LEFT);
      this.#direction = DIRECTIONS.LEFT;
      this.#updateVelocity(true, -100);
    } else {
      this.#updateVelocity(true, 0);
    }
    if (
      !controls.isUpJustDown ||
      !controls.isDownJustDown ||
      !controls.isLeftDown ||
      !controls.isRightDown
    ) {
      switch (this.#direction) {
        case DIRECTIONS.UP:
          this.playAnimation(PLAYER_ANIMATION_KEYS.IDLE_UP);
          break;
        case DIRECTIONS.DOWN:
          this.playAnimation(PLAYER_ANIMATION_KEYS.IDLE_DOWN);
          break;
        case DIRECTIONS.LEFT:
          this.playAnimation(PLAYER_ANIMATION_KEYS.IDLE_LEFT);
          break;
        case DIRECTIONS.RIGHT:
          this.playAnimation(PLAYER_ANIMATION_KEYS.IDLE_RIGHT);
          break;
      }
    }
    this.#normalizeVelocity();
  }
  #updateVelocity(isX: boolean, vlalue: number) {
    if (!isPhysicsArcadeBody(this.body)) {
      return;
    }
    if (isX) {
      this.body.setVelocityX(vlalue);
    } else {
      this.body.setVelocityY(vlalue);
    }
  }
  #normalizeVelocity() {
    if (!isPhysicsArcadeBody(this.body)) {
      return;
    }
    this.body.velocity.normalize().scale(300);
  }
}
