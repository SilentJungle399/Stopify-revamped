<template>
	<input
		type="text"
		v-model="songInput"
		@keypress.enter="songSearch"
		placeholder="Enter song name or YouTube URL"
	/>
	<div class="results-section">
		<h1 v-if="songResults.length > 0">Songs</h1>
		<div class="youtube-result" v-for="song in songResults" v-if="songResults.length > 0">
			<div class="youtube-result-thumbnail">
				<button class="add" @click="() => $io.emit('queueUpdate', 'addSong', token, song)">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="48"
						viewBox="0 -960 960 960"
						width="48"
					>
						<path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z" />
					</svg>
				</button>
				<img :src="song.thumbnail" />
			</div>
			<div class="youtube-result-desc">
				<div class="youtube-result-title">{{ song.title }}</div>
				<div class="youtube-result-artist">
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							viewBox="0 0 24 24"
							width="16"
							v-if="song.explicit"
						>
							<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 6h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1z" />
						</svg>
						{{ song.artist }}
					</span>
					<span>{{ song.duration }}</span>
				</div>
			</div>
		</div>
		<h1 v-if="videoResults.length > 0">Videos</h1>
		<div class="youtube-result" v-for="song in videoResults" v-if="videoResults.length > 0">
			<div class="youtube-result-thumbnail">
				<button class="add" @click="() => $io.emit('queueUpdate', 'addSong', token, song)">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="48"
						viewBox="0 -960 960 960"
						width="48"
					>
						<path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z" />
					</svg>
				</button>
				<img :src="song.thumbnail" />
			</div>
			<div class="youtube-result-desc">
				<div class="youtube-result-title">{{ song.title }}</div>
				<div class="youtube-result-artist">
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							viewBox="0 0 24 24"
							width="16"
							v-if="song.explicit"
						>
							<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 6h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1z" />
						</svg>
						{{ song.artist }}
					</span>
					<span>{{ song.duration }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAuth } from "~/store";

const { $io } = useNuxtApp();
const auth = useAuth();

const token = computed(() => auth.token);

const songInput = ref("");
const songResults = ref<Song[]>([]);
const videoResults = ref<Song[]>([]);

const songSearch = async () => {
	const { data } = await useFetch("/api/search?query=" + songInput.value);
	console.log(data)
	// @ts-ignore
	songResults.value = data.value.filter((x: Song) => x.type === "song");
	// @ts-ignore
	videoResults.value = data.value.filter((x: Song) => x.type === "video");
};
</script>

<style scoped>
input {
	width: 85%;
	border: none;
	background-color: #151729;
	border-radius: 6px;
	color: white;
	padding: 12.5px 20px;
	font-size: 20px;
	transition: 0.2s;
	margin: 20px auto;
}

input:focus {
	outline: none;
}

.results-section {
	display: flex;
	width: 100%;
	flex-direction: column;
	margin: 0 auto 20px auto;
	user-select: none;
	overflow-y: auto;
}

.youtube-result {
	display: flex;
	width: 90%;
	margin: 20px auto;
	border-bottom: #252944 1px solid;
    margin-bottom: 0px;
    padding-bottom: 20px;
}

.youtube-result:hover {
	cursor: pointer;
}

img {
	height: 50px;
	transition: 0.2s;
}

h1 {
	font-family: Arial, Helvetica, sans-serif;
	font-weight: 400;
	margin-left: 30px;
	margin-bottom: 10px;
}

.youtube-result-desc {
	margin-left: 20px;
	font-family: Arial, Helvetica, sans-serif;
	width: 100%;
}

.youtube-result-title {
	font-size: 17px;
}

.youtube-result-artist {
	font-size: 15px;
	color: gray;
	margin-top: 5px;
	display: flex;
	justify-content: space-between;
}

.youtube-result-artist span {
	display: flex;
	justify-items: center;
}

.youtube-result-artist svg {
	fill: rgba(255, 255, 255, .5);
	margin-right: 3px;
}

.add {
	position: absolute;
	background: none;
	padding: 0;
	z-index: 10;
	margin: 0;
	border: 0;
	height: -webkit-fill-available;
	width: -webkit-fill-available;
	margin: auto 10px;
	opacity: 0;
	transition: 0.2s;
	cursor: pointer;
}

.add > svg {
	fill: white;
	height: 35px;
	width: 35px;
}

.youtube-result-thumbnail {
	display: flex;
	position: relative;
}

.youtube-result-thumbnail:hover img {
	opacity: 0.4;
}

.youtube-result-thumbnail:hover .add {
	opacity: 1;
}
</style>
