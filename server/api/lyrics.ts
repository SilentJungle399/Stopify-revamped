import { YTMUSIC_SECRET } from "../../config.json";
import fetch from "node-fetch";
import clientPromise from "../../utils/mongo";
import { ObjectId } from "mongodb";
import whitelist from "../../server-middleware/whitelist";

const ytMusicApi =
	process.env.NODE_ENV === "production"
		? "https://stopify.silentjungle.me/ytm"
		: "http://localhost:8080";

export default defineEventHandler(async (event) => {
	const url = new URL("https://stopify.silentjungle.me" + event.node.req.url!);
	const auth = event.node.req.headers.authorization;

	if (!auth) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
		});
	}

	const db = (await clientPromise).db();
	const user = await db.collection("users").findOne({ _id: new ObjectId(auth) });

	if (!user || whitelist[user.id] !== 1) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
		});
	}

	const searchResults = await fetch(ytMusicApi + "/spotify-lyrics?q=" + url.searchParams.get("query"), {
		headers: {
			Authorization: YTMUSIC_SECRET,
		},
	});
	return await searchResults.json();
});
