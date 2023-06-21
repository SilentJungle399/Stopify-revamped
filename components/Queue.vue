<template>
	<div class="youtube-search" :style="`width: ${youtubeActive ? '700px' : '0px'}`">
		<Youtube v-if="youtubeActive" />
	</div>
	<div class="queue-section">
		<div style="display: flex">
			<div
				style="
					margin: 20px 40px;
					font-size: 25px;
					font-family: Arial, Helvetica, sans-serif;
				"
			>
				Queue
			</div>
			<span
				class="material-symbols-outlined ytbutton"
				:style="`
					background-color: ${youtubeActive ? '#1c1f34' : 'none'}; 
					rotate: ${youtubeActive ? '135deg' : '0deg'}
				`"
				@click="() => (youtubeActive = !youtubeActive)"
			>
				add
			</span>
		</div>
		<hr
			style="
				width: 70%;
				background-color: #494c60;
				margin-top: 0px;
				border: none;
				height: 2px;
			"
		/>
		<div class="queue-result" v-for="song in queue">
			<div class="queue-result-thumbnail">
				<button
					class="delete"
					@click="() => $io.emit('queueUpdate', 'removeSong', token, song)"
				>
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
				<div class="queue-result-artist">
					{{ song.artist }} (Added by {{ song.addedBy ?? "Unknown" }})
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAuth, useQueue } from "~/store";

const { $io } = useNuxtApp();
const auth = useAuth();
const queueData = useQueue();
const queue = computed(() => queueData.queue.slice(1));
const token = computed(() => auth.token);

const youtubeActive = ref(false);
</script>

<style scoped>
.queue-section {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
	height: calc(100% - 100px);
	background-color: #23263e;
	position: fixed;
	top: 0;
	left: 0;
	width: 400px;
}

.youtube-search {
	position: absolute;
	background-color: #1c1f34;
	top: 0;
	left: 400px;
	height: calc(100% - 105px);
	transition: 0.2s;
	display: flex;
	flex-direction: column;
	z-index: 10;
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

.ytbutton {
	cursor: pointer;
	padding: 7px;
	transition: 0.2s;
	border-radius: 50%;
	margin: auto;
	margin-right: 20px;
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
