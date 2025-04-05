import { Position } from "@/Game/common/types";

export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position
  texture: string;
  frame?: string | number;
}
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(config: PlayerConfig) {
    const { scene, position: { x, y }, texture, frame } = config;
    super(scene, x, y, texture, frame || 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
  playAnimation(animationKey: string) {
    this.play(animationKey);
  }
}
