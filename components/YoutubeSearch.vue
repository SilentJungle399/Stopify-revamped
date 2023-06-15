<template>
	<input
		type="text"
		v-model="songInput"
		@keypress.enter="songSearch"
		placeholder="Enter song name or YouTube URL"
	/>
	<div class="results-section">
		<div
			class="youtube-result"
			v-for="song in songResults"
			@click="() => $io.emit('queueUpdate', 'addSong', token, song)"
		>
			<div class="youtube-result-thumbnail">
				<img :src="song.thumbnail" />
			</div>
			<div class="youtube-result-desc">
				<div class="youtube-result-title">{{ song.title }}</div>
				<div class="youtube-result-artist">{{ song.artist }}</div>
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

const songSearch = () => {
	$io.emit("songSearch", songInput.value);
};

onMounted(() => {
	$io.on("songSearchResults", (data: Song[]) => {
		songResults.value = data;
	});
});
</script>

<style scoped>
input {
	width: 85%;
	border: 1px solid white;
	border-radius: 6px;
	background-color: black;
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
}

.youtube-result:hover {
	cursor: pointer;
}

img {
	height: 50px;
}

.youtube-result-desc {
	margin-left: 20px;
	font-family: Arial, Helvetica, sans-serif;
}

.youtube-result-title {
	font-size: 17px;
}

.youtube-result-artist {
	font-size: 15px;
	color: gray;
	margin-top: 5px;
}
</style>
