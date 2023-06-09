import { Server } from "socket.io";
import ytsr from "ytsr";
import fetch from "node-fetch";
import clientPromise from "~/utils/mongo";
import { ObjectId } from "bson";

const io = new Server(3003, {
	cors: {
		origin: "*",
	},
});

const clientId = "900755240532471888";
const secret = "Lc6ZR4dS759vhgfGkEy3daLuHhH9FqiS";
const redirectUri = "http://localhost:3000/api/callback";

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

	socket.on("validateLogin", async (code: string, callback) => {
		const API_ENDPOINT = "https://discord.com/api/v10";
		const data = (await (
			await fetch(`${API_ENDPOINT}/oauth2/token`, {
				method: "POST",
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: secret,
					grant_type: "authorization_code",
					redirect_uri: redirectUri,
					code,
				}),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			})
		).json()) as TokenResponse;

		const user: any = await (
			await fetch(`${API_ENDPOINT}/users/@me`, {
				headers: {
					authorization: `${data.token_type} ${data.access_token}`,
				},
			})
		).json();

		const db = (await clientPromise).db();
		const users = db.collection("users");
		const userExists = await users.findOne({ id: user.id });
		if (!userExists) {
			const doc = await users.insertOne(user);
			callback(doc.insertedId.toString());
		} else {
			await users.updateOne({ _id: new ObjectId(userExists._id) }, { $set: user });
			callback(userExists._id.toString());
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
