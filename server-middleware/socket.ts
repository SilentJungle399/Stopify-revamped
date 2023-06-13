import { Server } from "socket.io";
import ytsr from "ytsr";
import fetch from "node-fetch";
import clientPromise from "~/utils/mongo";
import { ObjectId } from "bson";
import { DISCORD_SECRET } from "~/config";

const io = new Server(3003, {
	cors: {
		origin: "*",
	},
});

const clientId = "900755240532471888";
const redirectUri = "http://localhost:3000/api/callback";

const sockConns = new Map<string, UserData>();
var anonUsers = 0;

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
		const API_ENDPOINT = "https://discord.com/api/v8";
		const data = (await (
			await fetch(`${API_ENDPOINT}/oauth2/token`, {
				method: "POST",
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: DISCORD_SECRET,
					grant_type: "authorization_code",
					redirect_uri: redirectUri,
					code,
				}),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			})
		).json()) as TokenResponse;

		const userReq = await fetch(`${API_ENDPOINT}/users/@me`, {
			headers: {
				authorization: `${data.token_type} ${data.access_token}`,
			},
		});

		if (userReq.status !== 200) {
			return;
		}

		const user: any = await userReq.json();

		const db = (await clientPromise).db();
		const users = db.collection("users");
		const userExists = await users.findOne({ id: user.id });
		const retData: UserData = {
			id: user.id,
			username: user.username,
			avatar: user.avatar,
			discriminator: user.discriminator,
			global_name: user.global_name,
		};
		if (!userExists) {
			const doc = await users.insertOne(user);
			callback({ data: retData, token: doc.insertedId.toString() });
		} else {
			await users.updateOne({ _id: new ObjectId(userExists._id) }, { $set: user });
			callback({ data: retData, token: userExists._id.toString() });
		}
	});

	socket.on("validateToken", async (token: string, callback) => {
		const db = (await clientPromise).db();
		const users = db.collection("users");
		const user = await users.findOne({ _id: new ObjectId(token) });
		if (!user) {
			anonUsers++;
			return io.emit("userJoin", null);
		}

		console.log("Validated token", user.id);

		const retData: UserData = {
			id: user.id,
			username: user.username,
			avatar: user.avatar,
			discriminator: user.discriminator,
			global_name: user.global_name,
		};
		sockConns.set(socket.id, retData);
		io.emit("userJoin", retData);
		callback(retData);
	});

	socket.on("roomUsersRequest", (callback) => {
		callback({
			userlist: [...sockConns.values()],
			anonUsers,
		});
	});

	socket.on(
		"newMessage",
		async ({ token, message }: { token: string; message: PartialMessage }) => {
			const db = (await clientPromise).db();
			const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
			if (!user) {
				return;
			}
			message.content = message.content.trim();
			const retMsg = {
				...message,
				timestamp: Date.now(),
				user: {
					id: user.id,
					username: user.username,
					avatar: user.avatar,
					discriminator: user.discriminator,
					global_name: user.global_name,
				},
			};
			const msg = await db.collection("messages").insertOne(retMsg);

			io.emit("newIncomingMessage", {
				...retMsg,
				id: msg.insertedId.toString(),
			});
		}
	);

	socket.on(
		"loadMessages",
		async ({ token, timestamp }: { token: string; timestamp: number }, callback) => {
			const db = (await clientPromise).db();
			const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
			if (!user) {
				return;
			}
			const messages = await db
				.collection("messages")
				.find(timestamp ? { timestamp: { $lt: timestamp } } : {})
				.toArray();
			const retMsgs = messages.map((msg) => {
				const retMsg = {
					...msg,
					id: msg._id.toString(),
				};
				// @ts-ignore
				delete retMsg._id;
				return retMsg;
			});
			callback(retMsgs);
		}
	);

	socket.on("disconnecting", () => {
		console.log("disconnected", socket.id);
		const user = sockConns.get(socket.id);
		if (user) {
			sockConns.delete(socket.id);
		} else {
			anonUsers--;
		}
		io.emit("userLeave", user?.id);
	});
});

// @ts-ignore
export default fromNodeMiddleware(async (req, res) => {
	res.statusCode = 200;
	res.end();
});
