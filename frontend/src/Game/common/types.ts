export type Position = { x: number, y: number }
export enum DIRECTIONS {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right"
}
export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
