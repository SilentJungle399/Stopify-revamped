import { Server } from "socket.io";

const io = new Server(3003, {
	cors: {
		origin: "*",
	},
});

io.on("connection", async (socket) => {
	console.log("Connection", socket.id);

	socket.on("disconnecting", () => {
		console.log("disconnected", socket.id);
		socket.broadcast.emit("message", `${socket.id} left`);
	});
});

// @ts-ignore
export default fromNodeMiddleware(async (req, res) => {
	res.statusCode = 200;
	res.end();
});
