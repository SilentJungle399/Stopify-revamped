import { defineStore } from "pinia";
import { usePlayer } from ".";

export default defineStore("buffer", () => {
	const sourceBuffer = ref<SourceBuffer>();
	const bufferQueue = ref<ArrayBuffer[]>([]);

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

	const add = (data: ArrayBuffer) => {
		if (sourceBuffer.value?.updating || bufferQueue.value.length > 0) {
			bufferQueue.value.push(data);
		} else {
			sourceBuffer.value?.appendBuffer(data);
		}
	};

	const clean = () => {
		bufferQueue.value = [];
		sourceBuffer.value?.abort();
	};

	return { sourceBuffer, add, setBuffer, clean };
});
