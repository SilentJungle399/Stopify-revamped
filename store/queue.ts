import { defineStore } from "pinia";
import { usePlayer, useBuffer } from ".";

async function play(url: string) {
	const { $io } = useNuxtApp();
	const player = usePlayer();
	const buffer = useBuffer();

	buffer.clean();

	const mediaSource = new MediaSource();
	mediaSource.addEventListener("sourceopen", async () => {
		buffer.setBuffer(mediaSource.addSourceBuffer('audio/webm; codecs="opus"'));
		$io.emit("songRequest", url);
	});
	player.setSource(URL.createObjectURL(mediaSource));
}

export default defineStore("queue", () => {
	const { $io } = useNuxtApp();

	const queue = ref<Song[]>([]);
	const history = ref<Song[]>([]);
	const add = (item: Song) => {
		queue.value.push(item);

		if (queue.value.length === 1) {
			play(item.url);
		}
	};
	const remove = (item: Song) => {
		const index = queue.value.indexOf(item);
		if (index > -1) queue.value.splice(index, 1);
	};
	const current = () => queue.value[0];
	const next = () => {
		const player = usePlayer();
		const buffer = useBuffer();
		const currentId = computed(() => buffer.currentId);
		$io.removeListener(`songData-${currentId.value}`);
		history.value.push(queue.value.shift()!);
		if (queue.value.length > 0) {
			player.pause();
			buffer.clean();
			play(queue.value[0].url);
		}
	};
	const clear = () => queue.value.splice(0, queue.value.length);

	const previous = () => {
		const player = usePlayer();
		const buffer = useBuffer();
		if (history.value.length > 0) {
			queue.value.unshift(history.value.pop()!);
			player.pause();
			buffer.clean();
			play(queue.value[0].url);
		}
	};

	return { queue, add, remove, current, next, clear, previous };
});
