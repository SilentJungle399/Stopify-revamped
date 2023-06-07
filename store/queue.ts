import { defineStore } from "pinia";
import { usePlayer, useBuffer } from ".";

async function play(url: string) {
	const { $io } = useNuxtApp();
	const player = usePlayer();
	const buffer = useBuffer();

	buffer.clean();

	const mediaSource = new MediaSource();
	mediaSource.addEventListener("sourceopen", () => {
		buffer.setBuffer(mediaSource.addSourceBuffer('audio/webm; codecs="opus"'));
		$io.emit("songRequest", url);
	});
	player.setSource(URL.createObjectURL(mediaSource));
}

export default defineStore("queue", () => {
	const queue = ref<Song[]>([]);
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
	const next = () => queue.value.shift();
	const clear = () => queue.value.splice(0, queue.value.length);

	return { queue, add, remove, current, next, clear };
});
