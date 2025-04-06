import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { MyState } from "./MyState";

// Player state schema
class PlayerState extends Schema {
  @type("number") declare x: number;
  @type("number") declare y: number;
  @type("string") declare animation: string;
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.animation = "idle-down";
  }
}

// Game room state schema
class GameRoomState extends Schema {
  @type({ map: PlayerState }) declare players: MapSchema<PlayerState>;
  constructor() {
    super();
    this.players = new MapSchema<PlayerState>();
  }
}

export class GameRoom extends Room<GameRoomState> {
  // Maximum clients allowed in the room
  maxClients = 16;

  onCreate(options: any) {
    console.log("GameRoom created!", options);

    // Initialize room state
    this.setState(new GameRoomState());

    // Handle position updates from clients
    this.onMessage("updatePosition", (client, message) => {
      const player = this.state.players.get(client.sessionId);

      if (player) {
        player.x = message.x;
        player.y = message.y;

        if (message.animation) {
          player.animation = message.animation;
        }
      }

      // Broadcast the update to all clients except sender
      this.broadcast("updatePosition", {
        sessionId: client.sessionId,
        x: message.x,
        y: message.y,
        animation: message.animation
      }, { except: client });
    });

    this.onMessage("chatMessage", (client, data) => {
      // Broadcast chat message to all clients
      this.broadcast("chatMessage", {
        senderId: client.sessionId,
        senderName: data.senderName || "Player",
        text: data.text
      });
    });

    // Handle room collision events
    this.onMessage("roomCollision", (client, message) => {
      console.log(`Player ${client.sessionId} collided with room ${message.roomId}`);

      // Broadcast room collision to all clients
      this.broadcast("roomCollision", {
        sessionId: client.sessionId,
        roomId: message.roomId,
        playerPosition: message.playerPosition
      });
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`Client ${client.sessionId} joined the room`);

    // Create player state for the new client
    const player = new PlayerState();
    player.x = options.x || 250;
    player.y = options.y || 100;
    player.animation = options.animation || "idle-down";

    // Add player to the room state
    this.state.players.set(client.sessionId, player);

    // Notify all clients about the new player
    this.broadcast("playerJoined", {
      sessionId: client.sessionId,
      x: player.x,
      y: player.y
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Client ${client.sessionId} left the room`);

    // Remove player from the room state
    this.state.players.delete(client.sessionId);

    // Notify all remaining clients about the player leaving
    this.broadcast("playerLeft", {
      sessionId: client.sessionId
    });
  }

  onDispose() {
    console.log("GameRoom disposed");
  }
}
