import { Server } from "socket.io";
import fetch from "node-fetch";
import clientPromise from "~/utils/mongo";
import { ObjectId } from "bson";
import { DISCORD_SECRET, YTMUSIC_SECRET } from "~/config.json";
import whitelist from "./whitelist";
import ytdl from "ytdl-core";

const io = new Server(process.env.NODE_ENV === "production" ? 25692 : 3003, {
	cors: {
		origin: "*",
	},
});

const clientId = "900755240532471888";

const redirectUri =
	process.env.NODE_ENV === "production"
		? "https://stopify.silentjungle.me/api/callback"
		: "http://localhost:3000/api/callback";
const ytMusicApi =
	process.env.NODE_ENV === "production"
		? "https://stopify.silentjungle.me/ytm"
		: "http://localhost:8080";

const sockConns = new Map<string, UserData>();
const anonUsers = async () => {
	const sockets = await io.fetchSockets();
	return sockets.filter((socket) => !sockConns.has(socket.id)).length;
};

const playerState: PlayerState = {
	playing: false,
	currentTime: 0,
	song: null,
	queue: [],
	autoplay: false,
	loop: 1,
};

const parseDuration = (duration: string) => {
	const parts = duration.split(":");
	return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

const shorten = (content: string | undefined) => {
	return content ? (content.length > 20 ? content?.substring(0, 20) + "..." : content) : content;
};

const getLyrics = async (_id: string) => {
	const res = await fetch(ytMusicApi + "/lyrics?id=" + _id, {
		headers: {
			Authorization: YTMUSIC_SECRET,
		},
	});

	if (res.status !== 200) return "No lyrics available.";

	const data = await res.text();
	return data;
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

const checkPermission = async (token: string): Promise<UserData | null> => {
	const db = (await clientPromise).db();
	const user = await db.collection("users").findOne({ _id: new ObjectId(token) });
	if (!user) return user;

	const retData: UserData = {
		id: user.id,
		username: user.username,
		avatar: user.avatar,
		discriminator: user.discriminator,
		global_name: user.global_name,
		permission: whitelist[user.id] || 3,
	};
	return retData;
};

const nextSong = async () => {
	if (!playerState.song) return;
	if (playerState.queue.length === 0 && playerState.autoplay) {
		playerState.currentTime = 0;
		const relatedSong = await fetch(ytMusicApi + "/suggestion?id=" + playerState.song.id, {
			headers: {
				Authorization: YTMUSIC_SECRET,
			},
		});
		playerState.song = (await relatedSong.json()) as Song;
		playerState.song.addedBy = "autoplay";
		const lyrics = await getLyrics(playerState.song.id);
		io.emit("lyricsResponse", lyrics);
		io.emit("playerState", playerState);
	} else {
		switch (playerState.loop) {
			case 1:
				playerState.currentTime = 0;
				playerState.song = playerState.queue.shift() || null;
				if (playerState.song) {
					const lyrics = await getLyrics(playerState.song.id);
					io.emit("lyricsResponse", lyrics);
				}
				io.emit("playerState", playerState);
				break;
			case 2:
				playerState.currentTime = 0;
				playerState.queue.push(playerState.song);
				playerState.song = playerState.queue.shift() || null;
				if (playerState.song) {
					const lyrics = await getLyrics(playerState.song.id);
					io.emit("lyricsResponse", lyrics);
				}
				io.emit("playerState", playerState);
				break;
			case 3:
				playerState.currentTime = 0;
				io.emit("playerState", playerState);
				break;
			default:
				break;
		}
	}
};

setInterval(async () => {
	if (playerState.song && playerState.playing) {
		playerState.currentTime += 0.5;
		if (playerState.currentTime > parseDuration(playerState.song.duration)) {
			await nextSong();
		}
	} else if (!playerState.song) {
		playerState.currentTime = 0;
	}
}, 500);

io.on("connection", async (socket) => {
	console.log("Connection", socket.id);
	socket.emit("playerState", {
		...playerState,
		anonUsers: await anonUsers(),
		knownUsers: [...sockConns.values()],
	});

	setInterval(async () => {
		socket.emit("playerState", {
			...playerState,
			anonUsers: await anonUsers(),
			knownUsers: [...sockConns.values()],
		});
	}, 5000);

	socket.on("songSearch", async (query: string) => {
		const searchResults = await fetch(ytMusicApi + "/search?q=" + query);
		socket.emit("songSearchResults", await searchResults.json());
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
			permission: whitelist[user.id] || 3,
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
			permission: whitelist[user.id] || 3,
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
			const user = await checkPermission(token);
			if (!user || user.permission === 3) return;
			const db = (await clientPromise).db();

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
					permission: whitelist[user.id] || 3,
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
			// const user = await checkPermission(token);
			// if (!user) return;

			const db = (await clientPromise).db();
			const messages = await db
				.collection("messages")
				.find(timestamp ? { timestamp: { $lt: timestamp } } : {})
				.sort({ timestamp: -1 })
				.limit(50)
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
		const user = await checkPermission(token);
		if (!user || user.permission !== 1) return;
		await sendSystemMessage(`${user.global_name} ${status ? "resumed" : "paused"} the song.`);
		playerState.playing = status;
		io.emit("playerState", playerState);
	});

	socket.on("stopSong", async (token: string) => {
		const user = await checkPermission(token);
		if (!user || user.permission !== 1) return;
		await sendSystemMessage(`${user.global_name} stopped the song.`);
		playerState.playing = false;
		playerState.song = null;
		io.emit("playerState", playerState);
	});

	socket.on("seekSong", async (token: string, perc: number) => {
		const user = await checkPermission(token);
		if (!user || user.permission !== 1) return;
		playerState.currentTime = (parseDuration(playerState.song?.duration!) * perc) / 100;
		io.emit("playerState", playerState);
	});

	socket.on("toggleAutoplay", async (token: string) => {
		const user = await checkPermission(token);
		if (!user || user.permission !== 1) return;
		playerState.autoplay = !playerState.autoplay;
		io.emit("playerState", playerState);
	});

	socket.on("setLoop", async (token: string, loop: 1 | 2 | 3) => {
		const user = await checkPermission(token);
		if (!user || user.permission !== 1) return;
		playerState.loop = loop;
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
			const user = await checkPermission(token);
			if (!user || user.permission !== 1) return;
			switch (event) {
				case "nextSong":
					if (system)
						await sendSystemMessage(
							`${user.global_name} skipped ${shorten(playerState.song?.title)}!`
						);

					await nextSong();
					io.emit("playerState", playerState);
					break;
				case "removeSong":
					console.log(song);
					await sendSystemMessage(`${user.global_name} removed ${song?.title}!`);
					playerState.queue = playerState.queue.filter((s) => s.id !== song?.id);
					io.emit("playerState", playerState);
					break;
				case "addSong":
					if (song) song.addedBy = user.global_name;
					if (playerState.queue.length === 0) {
						if (playerState.song) {
							playerState.queue.push(song!);
						} else {
							playerState.song = song;
							playerState.playing = true;
							playerState.currentTime = 0;
							const lyrics = await getLyrics(playerState.song?.id!);
							io.emit("lyricsResponse", lyrics);
						}
					} else {
						playerState.queue.push(song!);
					}
					await sendSystemMessage(`${user.global_name} added ${song?.title}!`);

					io.emit("playerState", playerState);
					break;
				default:
					break;
			}
		}
	);

	socket.on("lyricsRequest", async (_id: string) => {
		const lyrics = await getLyrics(_id);
		socket.emit("lyricsResponse", lyrics);
	});

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
