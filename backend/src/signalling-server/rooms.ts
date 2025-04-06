import { Server } from "socket.io";
import { httpServer } from "..";

// const io = new Server(httpServer, {
// 	cors: {
// 		origin: [
// 			"http://localhost:3000",
// 			"http://localhost:4173",
// 			"https://6znr3gxn-4173.inc1.devtunnels.ms",
// 			"https://6znr3gxn-3000.inc1.devtunnels.ms",
// 		],
// 		optionsSuccessStatus: 200,
// 		methods: ["GET", "POST"],
// 	},
// });

// const rooms: { [roomID: string]: string[] } = {};
// const socketToRoom: { [socketID: string]: string } = {};

// io.on("connection", (socket) => {
// 	console.log(`${socket.id} connected`);

// 	socket.on("joinRoom", (roomID) => {
// 		console.log(`${socket.id} joining ${roomID}`);

// 		if (rooms[roomID]) {
// 			const length = rooms[roomID].length;
// 			if (length === 4) {
// 				socket.emit("room full");
// 				return;
// 			}
// 			rooms[roomID].push(socket.id);
// 		} else {
// 			rooms[roomID] = [socket.id];
// 		}
// 		socketToRoom[socket.id] = roomID;
// 		console.log(`Users in room ${roomID}`, rooms[roomID]);
// 		const usersInThisRoom = rooms[roomID].filter((id) => id !== socket.id);

// 		socket.emit("allUsers", usersInThisRoom);
// 	});

// 	socket.on(
// 		"sendSignal",
// 		(payload: { signal: any; userToSignal: string; callerID: string }) => {
// 			console.log(
// 				`Server: ${payload.callerID} inviting ${payload.userToSignal}`
// 			);

// 			io.to(payload.userToSignal).emit("userJoined", {
// 				signal: payload.signal,
// 				callerID: payload.callerID,
// 			});
// 		}
// 	);

// 	socket.on("returnSignal", (payload) => {
// 		console.log(`Server: ${socket.id} sending back return signal.`);

// 		io.to(payload.callerID).emit("receiveReturnSignal", {
// 			signal: payload.signal,
// 			id: socket.id,
// 		});
// 	});

// 	socket.on("disconnect", () => {
// 		const roomID = socketToRoom[socket.id];
// 		let room = rooms[roomID];
// 		if (room) {
// 			room = room.filter((id) => id !== socket.id);
// 			rooms[roomID] = room;
// 		}

// 		socket.broadcast.emit("userDisconnected", socket.id);
// 	});
// });
