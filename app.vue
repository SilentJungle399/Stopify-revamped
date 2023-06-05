<template>
	<div>hi</div>
	<button @click="play">test</button>
	<audio id="testaudio" controls preload="none"></audio>
</template>

<script setup lang="ts">
const { $io } = useNuxtApp();

let sourceBuffer: SourceBuffer;
let bufferQueue: ArrayBuffer[] = [];
const songMetadata = ref();

async function play() {
	sourceBuffer?.abort();
	bufferQueue = [];

	const audio = document.getElementById("testaudio") as HTMLAudioElement;
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
