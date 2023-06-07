<template>
	<!-- <button @click="play">test</button> -->
	<queue-section></queue-section>
	<song-section></song-section>
	<div class="player-section">
		<div class="song-details" v-if="current">
			<img :src="current.thumbnail" alt="" />
			<div class="song-description">
				<div class="song-title" :title="current.title">
					{{
						current.title.length > 50
							? current.title.slice(0, 50) + "..."
							: current.title
					}}
				</div>
				<div class="song-artist" :title="current.artist">
					{{
						current.artist.length > 50
							? current.artist.slice(0, 50) + "..."
							: current.artist
					}}
				</div>
			</div>
		</div>

		<div class="audio-controls">
			<div class="controls">
				<div class="control previous">
					<span class="material-symbols-outlined"> skip_previous </span>
				</div>
				<div class="control playpause">
					<span
						class="material-symbols-outlined"
						style="font-size: 45px"
						v-if="playing"
						@click="() => player.pause()"
					>
						pause_circle
					</span>
					<span
						class="material-symbols-outlined"
						style="font-size: 45px"
						v-else
						@click="() => player.play()"
					>
						play_circle
					</span>
				</div>
				<div class="control skip">
					<span class="material-symbols-outlined"> skip_next </span>
				</div>
			</div>
			<div class="seekbar"></div>
		</div>
		<audio id="audio" controls preload="none" style="display: none"></audio>
	</div>
</template>

<script setup lang="ts">
import { useQueue, usePlayer, useBuffer } from "~/store";

const { $io } = useNuxtApp();

const queueData = useQueue();
const player = usePlayer();
const buffer = useBuffer();

const current = computed(() => queueData.current());
const audio = computed(() => player.audio);
const playing = computed(() => player.playing);

onMounted(() => {
	player.setAudio(document.getElementById("audio") as HTMLAudioElement);

	$io.on("songData", async (data: ArrayBuffer) => {
		buffer.add(data);
	});
});
</script>

<style>
body {
	background-color: black;
	color: white;
	user-select: none;
}

.player-section {
	position: absolute;
	bottom: 50px;
	right: 50px;
	height: 100px;
	width: calc(100vw - 100px);
	border: 1px solid white;
	border-radius: 20px;
	display: flex;
}

.song-details {
	display: flex;
	position: absolute;
	margin-left: 20px;
	top: 20px;
}

.song-details img {
	height: 60px;
	margin: auto 0;
}

.song-description {
	margin: auto 0;
	margin-left: 20px;
	font-family: Arial, Helvetica, sans-serif;
}

.song-title {
	font-size: 17px;
}

.song-artist {
	margin-top: 5px;
	color: gray;
	font-size: 15px;
}

.controls {
	display: flex;
	margin: auto;
}

.control {
	cursor: pointer;
	margin: auto 5px;
}

.audio-controls {
	margin: auto;
	display: flex;
	flex-direction: column;
}

.seekbar {
	width: 500px;
	height: 3px;
	background-color: white;
	border-radius: 10px;
	margin: auto;
}

::-webkit-scrollbar {
	width: 7px;
	height: 7px;
}

/* Track */
::-webkit-scrollbar-track {
	background: black;
	border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: white;
	border-radius: 10px;
}
</style>
