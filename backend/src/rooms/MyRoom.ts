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
  }

  onJoin(client: Client, options: any) {
    console.log(`Client ${client.sessionId} joined the room`);
    this.state.players.set(client.sessionId, new Player());
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Client ${client.sessionId} left the room`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Room disposed");
  }
}
