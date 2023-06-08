import { defineStore } from "pinia";
import { useQueue } from ".";

export default defineStore("player", () => {
	const audio = ref<HTMLAudioElement | null>(null);
	const playing = ref(false);
	const loading = ref(false);
	const progress = ref(0);
	const duration = ref(0);

	const setAudio = (element: HTMLAudioElement) => {
		audio.value = element;
		element.volume = 0.5;
		const queue = useQueue();

		const seekbar = document.getElementById("progress") as HTMLInputElement;
		var timeout: NodeJS.Timeout;
		element.addEventListener("timeupdate", () => {
			seekbar.style.width = `${(element.currentTime / element.duration) * 100}%`;
			if (audio.value?.duration! - audio.value?.currentTime! < 0.5) {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					element.pause();
					queue.next();
				}, 1000);
			}
		});
		element.addEventListener("pause", () => {
			playing.value = false;
		});
		element.addEventListener("play", () => {
			playing.value = true;
		});
	};

	const play = () => {
		if (audio.value) {
			audio.value.play();
			playing.value = true;
		}
	};
	const pause = () => {
		if (audio.value) {
			audio.value.pause();
			playing.value = false;
		}
	};
	const seek = (time: number) => {
		if (audio.value) {
			audio.value.currentTime = time;
		}
	};
	const setVolume = (volume: number) => {
		if (audio.value) {
			audio.value.volume = volume;
		}
	};
	const setSource = (source: string) => {
		if (audio.value) {
			audio.value.src = source;
		}
	};

	return {
		audio,
		playing,
		loading,
		progress,
		duration,
		play,
		pause,
		seek,
		setVolume,
		setAudio,
		setSource,
	};
});
