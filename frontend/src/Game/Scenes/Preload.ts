export class PreloadScene extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    this.load.pack("mainpack", "assets/main/assets.json");
  }
  create() {

  }
  update() {

  }
}
