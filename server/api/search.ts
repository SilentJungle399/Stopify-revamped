import { YTMUSIC_SECRET } from "../../config.json";
import fetch from "node-fetch";

const ytMusicApi =
	process.env.NODE_ENV === "production"
		? "https://stopify.silentjungle.me/ytm"
		: "http://localhost:8080";

export default defineEventHandler(async (event) => {
	const url = new URL("https://stopify.silentjungle.me" + event.node.req.url!);
	const searchResults = await fetch(ytMusicApi + "/search?q=" + url.searchParams.get("query"), {
		headers: {
			Authorization: YTMUSIC_SECRET,
		},
	});
	return await searchResults.json();
});
