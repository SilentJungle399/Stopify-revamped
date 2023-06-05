<template>
	<div>hi</div>
	<button @click="play">test</button>
	<audio id="testaudio" controls preload="none"></audio>
</template>

<script setup lang="ts">
const { $io } = useNuxtApp();

async function play() {
	$io.emit("songRequest", "https://www.youtube.com/watch?v=ox4tmEV6-QU");

	const bufferChunks: ArrayBuffer[] = [];
	const audio = document.getElementById("testaudio") as HTMLAudioElement;
	audio.volume = 0.5;
	const songMetadata = ref({});
	const playableBlob = ref<Blob>();

	$io.on("songMetadata", (data) => {
		songMetadata.value = data;
	});

	$io.on("songData", (data) => {
		bufferChunks.push(data);

		if (bufferChunks.length === 5) {
			const blob = new Blob(bufferChunks);
			const chunkDuration = getDuration(bufferChunks, songMetadata.value);
			const url = URL.createObjectURL(blob);
			audio.src = url;
			audio.play();

			audio.addEventListener("ended", () => {
				const blob = new Blob(bufferChunks);
				const url = URL.createObjectURL(blob);
				audio.src = url;
				audio.currentTime = chunkDuration;
				audio.play();
			});

			audio.addEventListener("error", () => {
				URL.revokeObjectURL(url);
			});
		}
	});
}

const getDuration = (chunks: ArrayBuffer[], songMetadata: any) => {
	const chunkSize = chunks.map((chunk) => chunk.byteLength);
	return (chunkSize.reduce((a, b) => a + b) * 8) / songMetadata.bitrate;
};
</script>
