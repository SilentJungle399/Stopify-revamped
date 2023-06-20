import { Server } from "socket.io";
import ytsr from "ytsr";
import fetch from "node-fetch";
import clientPromise from "~/utils/mongo";
import { ObjectId } from "bson";
import { DISCORD_SECRET } from "~/config";
import whitelist from "./whitelist";

const io = new Server(3003, {
	cors: {
		origin: "*",
	},
});

const clientId = "900755240532471888";

const redirectUritest = "http://localhost:3000/api/callback";
const redirectUriprod = "https://stopify.silentjungle.me/api/callback";

const sockConns = new Map<string, UserData>();
const anonUsers = async () => {
	const sockets = await io.fetchSockets();
	return sockets.filter((socket) => !sockConns.has(socket.id)).length;
};

const playerState: PlayerState = {
	playing: false,
	currentTime: 0,
	volume: 100,
	song: null,
	queue: [],
};

const parseDuration = (duration: string) => {
	const parts = duration.split(":");
	return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

const shorten = (content: string | undefined) => {
	return content ? (content.length > 20 ? content?.substring(0, 20) + "..." : content) : content;
};

const sendSystemMessage = async (message: string) => {
	const msg = {
		timestamp: Date.now(),
		content: message,
		user: {
			id: "0",
			avatar: "",
			discriminator: "",
			username: "",
			global_name: "",
		},
	};
	const db = (await clientPromise).db();
	const doc = await db.collection("messages").insertOne(msg);
	io.emit("newIncomingMessage", {
		...msg,
		id: doc.insertedId.toString(),
	});
};

setInterval(() => {
	if (playerState.song && playerState.playing) {
		playerState.currentTime += 0.5;
		if (playerState.currentTime > parseDuration(playerState.song.duration)) {
			playerState.currentTime = 0;
			playerState.song = playerState.queue.shift() || null;
		}
	}
}, 500);

io.on("connection", async (socket) => {
	console.log("Connection", socket.id);
	socket.emit("playerState", playerState);

	setInterval(() => {
		socket.emit("playerState", playerState);
	}, 5000);

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
					id: item.type === "video" ? item.id + Date.now() : "",
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
					redirect_uri:
						process.env.NODE_ENV === "production" ? redirectUriprod : redirectUritest,
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
		sockConns.set(socket.id, retData);
		if (!userExists) {
			const doc = await users.insertOne(user);
			callback({ data: retData, token: doc.insertedId.toString() });
		} else {
			await users.updateOne({ _id: new ObjectId(userExists._id) }, { $set: user });
			callback({ data: retData, token: userExists._id.toString() });
		}
		io.emit("userLeave", null);
		io.emit("userJoin", retData);
	});

	socket.on("validateToken", async (token: string, callback) => {
		const db = (await clientPromise).db();
		const users = db.collection("users");
		const user = await users.findOne({ _id: new ObjectId(token) });
		if (!user) {
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

	socket.on("roomUsersRequest", async (callback) => {
		const unknownUsers = await anonUsers();
		callback({
			userlist: [...sockConns.values()],
			anonUsers: unknownUsers,
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

	socket.on("controlSong", async (token: string, status: boolean) => {
		const db = (await clientPromise).db();
		const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
		if (!user) {
			return;
		}
		playerState.playing = status;
		io.emit("playerState", playerState);
	});

	socket.on("stopSong", async (token: string) => {
		const db = (await clientPromise).db();
		const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
		if (!user) {
			return;
		}
		console.log("stopsong");
		playerState.playing = false;
		playerState.song = null;
		io.emit("playerState", playerState);
	});

	socket.on("seekSong", async (token: string, time: number) => {
		const db = (await clientPromise).db();
		const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
		if (!user) {
			return;
		}
		playerState.currentTime = time;
		io.emit("playerState", playerState);
	});

	socket.on("setSongVolume", async (token: string, volume: number) => {
		const db = (await clientPromise).db();
		const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
		if (!user) {
			return;
		}
		playerState.volume = volume;
		io.emit("playerState", playerState);
	});

	socket.on(
		"queueUpdate",
		async (
			event: "nextSong" | "removeSong" | "addSong",
			token: string,
			song: Song | null,
			system: boolean = true
		) => {
			console.log("queueUpdate", event, song?.title);
			const db = (await clientPromise).db();
			const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
			if (!user) {
				return;
			}
			switch (event) {
				case "nextSong":
					if (system)
						await sendSystemMessage(
							`${user.global_name} skipped ${shorten(song?.title)}!`
						);

					playerState.queue.shift();
					playerState.song = playerState.queue[0];
					playerState.playing = playerState.song !== null;
					playerState.currentTime = 0;

					io.emit("playerState", playerState);
					break;
				case "removeSong":
					playerState.queue = playerState.queue.filter((s) => s.id !== song?.id);
					io.emit("playerState", playerState);
					break;
				case "addSong":
					if (song) song.addedBy = user.global_name;
					playerState.queue.push(song!);
					if (playerState.queue.length === 1) {
						playerState.song = song;
						playerState.playing = true;
						playerState.currentTime = 0;
					}
					await sendSystemMessage(`${user.global_name} added a song!`);
					io.emit("playerState", playerState);
					break;
				default:
					break;
			}
		}
	);

	socket.on("disconnecting", () => {
		console.log("disconnected", socket.id);
		const user = sockConns.get(socket.id);
		if (user) {
			sockConns.delete(socket.id);
		}
		io.emit("userLeave", user?.id);
	});
});

// @ts-ignore
export default fromNodeMiddleware(async (req, res) => {
	res.statusCode = 200;
	res.end();
});
