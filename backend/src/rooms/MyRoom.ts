import { Room, Client } from "@colyseus/core";
import { MyState, Player } from "./MyState";

export class MyRoom extends Room<MyState> {
  maxClients = 4;

  onCreate(options: any) {
    this.state = new MyState();

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x += data.x;
        player.y += data.y;
        console.log(
          `${client.sessionId} moved to x: ${player.x}, y: ${player.y}`
        );
      }
    });
    this.onMessage("updatePosition", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      console.log(data);
      if (player) {
        player.x = data.x;
        player.y = data.y;
      }
    });
    this.onMessage("roomCollision", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      console.log("Your player has collided");
      if (player) {
        player.x = data.x;
        player.y = data.y;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`Client ${client.sessionId} joined the room`);
    const player = new Player();
    player.x = 100;
    player.y = 100;
    this.state.players.set(client.sessionId, player);
    // this.state.players.set(client.sessionId, new Player());
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Client ${client.sessionId} left the room`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Room disposed");
  }
}
