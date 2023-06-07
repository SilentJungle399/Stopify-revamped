<template>
	<!-- <button @click="play">test</button> -->
	<queue-section></queue-section>
	<song-section></song-section>
	<div class="player-section">
		<audio id="audio" controls preload="none" style="display: none"></audio>
	</div>
</template>

<script setup lang="ts">
const { $io } = useNuxtApp();

let sourceBuffer: SourceBuffer;
let bufferQueue: ArrayBuffer[] = [];
const songMetadata = ref();

async function play() {
	sourceBuffer?.abort();
	bufferQueue = [];

	const audio = document.getElementById("audio") as HTMLAudioElement;
	audio.volume = 0.5;

	const mediaSource = new MediaSource();
	mediaSource.addEventListener("sourceopen", () => {
		sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
		sourceBuffer.mode = "sequence";

		$io.emit("songRequest", "https://www.youtube.com/watch?v=ox4tmEV6-QU");

		sourceBuffer.addEventListener("update", () => {
			if (audio.paused && audio.currentTime === 0) {
				audio.play();
			}

			if (bufferQueue.length > 0 && !sourceBuffer.updating) {
				sourceBuffer.appendBuffer(bufferQueue.shift()!);
			}
		});
	});
	audio.src = URL.createObjectURL(mediaSource);
}

onMounted(() => {
	$io.on("songData", async (data: ArrayBuffer) => {
		if (sourceBuffer.updating || bufferQueue.length > 0) {
			bufferQueue.push(data);
		} else {
			sourceBuffer.appendBuffer(data);
		}
	});

	$io.on("songMetadata", (data) => {
		songMetadata.value = data;
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
	width: calc(100vw / 2 - 75px);
	border: 1px solid white;
	border-radius: 20px;
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
