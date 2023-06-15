import { defineStore } from "pinia";
import { useQueue, useAuth } from ".";

export default defineStore("player", () => {
	const { $io } = useNuxtApp();

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
					const auth = useAuth();
					const token = computed(() => auth.token);
					playing.value = false;
					$io.emit("queueUpdate", "nextSong", token.value);
					break;
				case 1:
					playing.value = true;
					console.log("started");
					break;
				case 2:
					playing.value = false;
					break;
				case 3:
					console.log("buffering");
					break;
				default:
					break;
			}
		},
	};

	const currentTime = (): number => {
		if (YTplayer.value && YTplayer.value.getCurrentTime) {
			return YTplayer.value.getCurrentTime();
		}
		return 0;
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
			} else {
				seekbar.style.width = `0%`;
			}
		}, 100);
	};

	const play = (e: PointerEvent | undefined, sync: boolean = false) => {
		const queue = useQueue();
		const current = computed(() => queue.current());
		if (YTplayer.value && current.value) {
			YTplayer.value.playVideo();
			if (!sync) {
				const auth = useAuth();
				const token = computed(() => auth.token);
				$io.emit("controlSong", token.value, true);
			}
			playing.value = true;
		}
	};
	const pause = (e: PointerEvent | undefined, sync: boolean = false) => {
		if (YTplayer.value && YTplayer.value.pauseVideo) {
			YTplayer.value.pauseVideo();
			if (!sync) {
				const auth = useAuth();
				const token = computed(() => auth.token);
				$io.emit("controlSong", token.value, false);
			}
			playing.value = false;
		}
	};
	const stop = (sync: boolean = false) => {
		if (YTplayer.value && YTplayer.value.stopVideo) {
			YTplayer.value.stopVideo();
			if (!sync) {
				const auth = useAuth();
				const token = computed(() => auth.token);
				$io.emit("stopSong", token.value);
			}
			playing.value = false;
			const seekbar = document.getElementById("progress") as HTMLInputElement;
			seekbar.style.width = `0%`;
		}
	};
	const seek = (time: number, sync: boolean = false) => {
		if (YTplayer.value && YTplayer.value.seekTo) {
			YTplayer.value.seekTo(time, true);
			if (!sync) {
				const auth = useAuth();
				const token = computed(() => auth.token);
				$io.emit("seekSong", token.value, time);
			}
		}
	};
	const setVolume = (volume: number, sync: boolean = false) => {
		if (YTplayer.value && YTplayer.value.setVolume) {
			YTplayer.value.setVolume(volume);
			if (!sync) {
				const auth = useAuth();
				const token = computed(() => auth.token);
				$io.emit("setSongVolume", token.value, volume);
			}
		}
	};
	const loadVideoByUrl = (song: Song, sync: boolean = false) => {
		if (YTplayer.value) {
			YTplayer.value.loadVideoByUrl(
				`http://www.youtube.com/v/${song.url.split("?v=")[1]}?version=3`
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
		currentTime,
	};
});
