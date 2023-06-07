<template>
	<div class="results-section">
		<div class="queue-result" v-for="song in queue">
			<div class="queue-result-thumbnail">
				<button class="delete" @click="() => queueData.remove(song)">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="48"
						viewBox="0 -960 960 960"
						width="48"
					>
						<path
							d="m330-288 150-150 150 150 42-42-150-150 150-150-42-42-150 150-150-150-42 42 150 150-150 150 42 42ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Z"
						/>
					</svg>
				</button>
				<img class="thumnail-image" :src="song.thumbnail" />
			</div>
			<div class="queue-result-desc">
				<div class="queue-result-title">{{ song.title }}</div>
				<div class="queue-result-artist">{{ song.artist }} (Added by {{ "Silent" }})</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useQueue } from "~/store";

const queueData = useQueue();
const queue = computed(() => queueData.queue);
</script>

<style>
.results-section {
	display: flex;
	width: 100%;
	flex-direction: column;
	margin: 20px auto 20px auto;
	overflow-y: auto;
	height: -webkit-fill-available;
	user-select: none;
}

.delete {
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

.queue-result:hover .thumnail-image {
	opacity: 0.4;
}

.queue-result:hover .delete {
	opacity: 1;
}

.delete svg {
	fill: white;
	height: 35px;
	width: 35px;
}

.queue-result {
	display: flex;
	width: 90%;
	margin: 20px auto;
}

img {
	height: 50px;
	transition: 0.2s;
	cursor: pointer;
}

.queue-result-thumbnail {
	margin: auto 0;
	position: relative;
	transition: 0.2s;
}

.queue-result-desc {
	margin-left: 20px;
	font-family: Arial, Helvetica, sans-serif;
	transition: 0.2s;
}

.queue-result-title {
	font-size: 17px;
}

.queue-result-artist {
	font-size: 15px;
	color: gray;
	margin-top: 5px;
}
</style>
