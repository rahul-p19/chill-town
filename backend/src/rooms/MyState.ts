import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") declare x: number;
  @type("number") declare y: number;

  constructor() {
    super();
    this.x = 0;
    this.y = 0;
  }
}

export class MyState extends Schema {
  @type({ map: Player }) declare players: MapSchema<Player>;

  constructor() {
    super();
    this.players = new MapSchema<Player>();
  }
}
