import { Server } from "socket.io";
import ytdl from "ytdl-core";
import ytsr from "ytsr";

const io = new Server(3003, {
	cors: {
		origin: "*",
	},
});

io.on("connection", async (socket) => {
	console.log("Connection", socket.id);

	socket.on("songSearch", async (query: string) => {
		const searchResults = await ytsr(query, { limit: 15 });
		socket.emit(
			"songSearchResults",
			searchResults.items
				.filter((item) => item.type === "video")
				.map((item) => ({
					artist: item.type === "video" ? item.author?.name : "Unknown",
					duration: item.type === "video" ? item.duration : "00:00",
					thumbnail: item.type === "video" ? item.bestThumbnail.url : "",
					title: item.type === "video" ? item.title : "Unknown",
					url: item.type === "video" ? item.url : "",
					views: item.type === "video" ? item.views : 0,
				}))
		);
	});

	socket.on("songRequest", async (url: string) => {
		const songData = await ytdl.getInfo(url);
		const formats = ytdl.filterFormats(songData.formats, "audioonly");
		const audioFormat = ytdl.chooseFormat(formats, { quality: "highestaudio" });

		const key = songData.videoDetails.videoId + Date.now();

		socket.emit("songMetadata", { audioFormat, id: key });

		const stream = ytdl.downloadFromInfo(songData, { format: audioFormat });

		var prep20Chunk: Buffer[] = [];
		for await (const chunk of stream) {
			prep20Chunk.push(chunk);
			if (prep20Chunk.length === 10) {
				socket.emit(`songData-${key}`, { chunk: Buffer.concat(prep20Chunk), id: key });
				prep20Chunk = [];
			}
		}
		if (prep20Chunk.length > 0) {
			socket.emit(`songData-${key}`, { chunk: Buffer.concat(prep20Chunk), id: key });
		}
	});

	socket.on("disconnecting", () => {
		console.log("disconnected", socket.id);
		// socket.broadcast.emit("message", `${socket.id} left`);
	});
});

// @ts-ignore
export default fromNodeMiddleware(async (req, res) => {
	res.statusCode = 200;
	res.end();
});
