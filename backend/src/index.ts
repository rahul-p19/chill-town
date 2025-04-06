import { createServer } from "http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import { MyRoom } from "./rooms/MyRoom";

const app = express();
export const httpServer = createServer(app);
const port = Number(process.env.PORT || 2567);

const server = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

server.define("my_room", MyRoom);

httpServer.listen(port, () => {
  console.log(`Colyseus server is listening on port ${port}`);
});
