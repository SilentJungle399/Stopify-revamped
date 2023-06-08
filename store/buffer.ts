import { defineStore } from "pinia";
import { usePlayer } from ".";

export default defineStore("buffer", () => {
	const currentId = ref<string>();
	const sourceBuffer = ref<SourceBuffer>();
	const bufferQueue = ref<ArrayBuffer[]>([]);
	const { $io } = useNuxtApp();

	const setBuffer = (buffer: SourceBuffer) => {
		sourceBuffer.value = buffer;
		sourceBuffer.value.mode = "sequence";

		const player = usePlayer();
		const audio = computed(() => player.audio);

		sourceBuffer.value.addEventListener("update", () => {
			if (audio.value?.paused && audio.value?.currentTime === 0) {
				player.play();
			}

			if (bufferQueue.value.length > 0 && !sourceBuffer.value?.updating) {
				sourceBuffer.value?.appendBuffer(bufferQueue.value.shift()!);
			}
		});
	};

	const add = (data: ArrayBuffer, id: string) => {
		if (sourceBuffer.value?.updating || bufferQueue.value.length > 0) {
			bufferQueue.value.push(data);
		} else {
			sourceBuffer.value?.appendBuffer(data);
		}
	};

	const setId = (id: string) => {
		currentId.value = id;
	};

	const clean = () => {
		bufferQueue.value = [];
		// sourceBuffer.value?.abort();
		currentId.value = undefined;
		const player = usePlayer();
		const audio = computed(() => player.audio);
		if (audio.value) {
			audio.value.pause();
			audio.value.currentTime = 0;
		}
	};

	return { sourceBuffer, add, setBuffer, clean, setId, currentId };
});
