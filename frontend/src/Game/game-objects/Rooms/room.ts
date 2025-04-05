import { Position } from "@/Game/common/types";
import { isPhysicsArcadeBody } from "@/Game/common/utils";

export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position
  texture: string;
}
export class Room extends Phaser.Physics.Arcade.Image {

  constructor(config: PlayerConfig) {
    const { scene, position: { x, y }, texture } = config;
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setImmovable(true);

    scene.events.on("update", this.update, this);
    scene.events.on("shutdown", () => {
      scene.events.off("update", this.update, this);
    }, this);
  }

  update() {

  }
}
