import { defineStore } from "pinia";
import { usePlayer } from ".";

export default defineStore("queue", () => {
	const queue = ref<Song[]>([]);
	const history = ref<Song[]>([]);
	const add = (item: Song) => {
		const player = usePlayer();
		queue.value.push(item);

		if (queue.value.length === 1) {
			player.loadVideoByUrl(item.url);
		}
	};
	const remove = (item: Song) => {
		const index = queue.value.indexOf(item);
		if (index > -1) queue.value.splice(index, 1);
	};
	const current = () => queue.value[0];
	const next = () => {
		const player = usePlayer();
		history.value.push(queue.value.shift()!);
		if (queue.value.length > 0) {
			player.stop();
			player.loadVideoByUrl(queue.value[0].url);
		} else {
			player.stop();
		}
	};
	const clear = () => queue.value.splice(0, queue.value.length);

	const previous = () => {
		const player = usePlayer();
		if (history.value.length > 0) {
			queue.value.unshift(history.value.pop()!);
			player.stop();
			player.loadVideoByUrl(queue.value[0].url);
		}
	};

	return { queue, add, remove, current, next, clear, previous };
});
