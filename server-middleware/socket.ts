import { Server } from "socket.io";
import ytdl from "ytdl-core";

const io = new Server(3003, {
	cors: {
		origin: "*",
	},
});

io.on("connection", async (socket) => {
	console.log("Connection", socket.id);

	socket.on("songRequest", async (url: string) => {
		const songData = await ytdl.getInfo(url);
		const formats = ytdl.filterFormats(songData.formats, "audioonly");
		const audioFormat = ytdl.chooseFormat(formats, { quality: "highestaudio" });
		socket.emit("songMetadata", audioFormat);

		const stream = ytdl.downloadFromInfo(songData, { format: audioFormat });
		stream.on("data", (chunk) => socket.emit("songData", chunk));
	});

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
