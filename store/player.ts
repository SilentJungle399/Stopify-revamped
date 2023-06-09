import { defineStore } from "pinia";
import { useQueue } from ".";

export default defineStore("player", () => {
	const YTplayer = ref<any>(undefined);
	const playing = ref(false);

	const events = {
		onStateChange: (event: any) => {
			// -1 (unstarted)
			// 0 (ended)
			// 1 (playing)
			// 2 (paused)
			// 3 (buffering)
			// 5 (video cued)

			switch (event.data) {
				case 0:
					const queue = useQueue();
					playing.value = false;
					queue.next();
					break;
				case 1:
					playing.value = true;
					break;
				case 2:
					playing.value = false;
					break;
				default:
					break;
			}
		},
	};

	const setYTplayer = (player: any) => {
		if (YTplayer.value) return;
		YTplayer.value = player;

		const seekbar = document.getElementById("progress") as HTMLInputElement;
		setInterval(() => {
			if (YTplayer.value.getCurrentTime) {
				const currentPos = YTplayer.value.getCurrentTime();
				const duration = YTplayer.value.getDuration();
				seekbar.style.width = `${(currentPos / duration) * 100}%`;
			}
		}, 100);
	};

	const play = () => {
		const queue = useQueue();
		const current = computed(() => queue.current());
		if (YTplayer.value && current.value) {
			YTplayer.value.playVideo();
			playing.value = true;
		}
	};
	const pause = () => {
		if (YTplayer.value) {
			YTplayer.value.pauseVideo();
			playing.value = false;
		}
	};
	const stop = () => {
		if (YTplayer.value) {
			YTplayer.value.stopVideo();
			playing.value = false;
			const seekbar = document.getElementById("progress") as HTMLInputElement;
			seekbar.style.width = `0%`;
		}
	};
	const seek = (time: number) => {
		if (YTplayer.value) {
			YTplayer.value.seekTo(time, true);
		}
	};
	const setVolume = (volume: number) => {
		if (YTplayer.value) {
			YTplayer.value.setVolume(volume);
		}
	};
	const loadVideoByUrl = (url: string) => {
		if (YTplayer.value) {
			YTplayer.value.loadVideoByUrl(
				`http://www.youtube.com/v/${url.split("?v=")[1]}?version=3`
			);
		}
	};

	return {
		YTplayer,
		playing,
		play,
		pause,
		seek,
		setVolume,
		setYTplayer,
		events,
		stop,
		loadVideoByUrl,
	};
});
