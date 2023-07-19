import { defineStore } from "pinia";
import { useQueue, useAuth, useSeekbar } from "..";

export default defineStore("player", () => {
	const { $io } = useNuxtApp();

	const YTplayer = ref<any>(undefined);
	const playing = ref(false);
	const autoplay = ref(false);
	const loop = ref(1);
	const volume = ref(100);

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
					playing.value = false;
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

		const seekbar = useSeekbar();
		const queue = useQueue();
		const current = computed(() => queue.current);
		setInterval(() => {
			if (YTplayer.value.getCurrentTime && current) {
				const currentPos = YTplayer.value.getCurrentTime();
				const duration = YTplayer.value.getDuration();
				seekbar.setProgress((currentPos / duration) * 100, true);
			} else {
				seekbar.setProgress(0, true);
			}
		}, 100);
	};

	const play = (e: PointerEvent | undefined, sync: boolean = false) => {
		const queue = useQueue();
		const current = computed(() => queue.current);
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
			const seekbar = useSeekbar();
			seekbar.setProgress(0, true);
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
	const setVolume = (volume: number) => {
		if (YTplayer.value && YTplayer.value.setVolume) {
			YTplayer.value.setVolume(volume);
		}
	};
	const loadVideoByUrl = (song: Song, sync: boolean = false) => {
		const queue = useQueue();
		if (YTplayer.value && YTplayer.value.loadVideoByUrl) {
			YTplayer.value.loadVideoByUrl(
				`http://www.youtube.com/v/${song.url.split("?v=")[1]}?version=3`
			);
		} else {
			queue.setCurrent(null);
		}
	};
	const setState = ({ _autoplay, _loop }: { _autoplay: boolean; _loop: 1 | 2 | 3 }) => {
		autoplay.value = _autoplay;
		loop.value = _loop;
	};

	return {
		YTplayer,
		playing,
		autoplay,
		loop,
		volume,
		play,
		pause,
		seek,
		setVolume,
		setYTplayer,
		events,
		stop,
		loadVideoByUrl,
		currentTime,
		setState,
	};
});
