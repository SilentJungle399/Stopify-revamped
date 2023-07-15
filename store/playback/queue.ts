import { defineStore } from "pinia";
import { usePlayer } from "..";

export default defineStore("queue", () => {
	const { $io } = useNuxtApp();
	const current = ref<Song | null>(null);
	const queue = ref<Song[]>([]);

	const add = (item: Song) => {
		const player = usePlayer();
		queue.value.push(item);

		if (queue.value.length === 1) {
			player.loadVideoByUrl(item);
		}
	};
	const remove = (item: Song) => {
		const index = queue.value.indexOf(item);

		if (index > -1) queue.value.splice(index, 1);
	};

	const next = () => {
		const player = usePlayer();

		if (queue.value.length > 0) {
			player.stop();
			current.value = queue.value.shift() || null;
			player.loadVideoByUrl(current.value!);
		} else {
			player.stop();
		}
	};

	const previous = () => {
		const player = usePlayer();
		player.seek(0);
	};

	const setQueue = (newQueue: Song[]) => {
		// const player = usePlayer();

		// if (queue.value.length > 0) {
		// 	if (newQueue.length === 0) {
		// 		player.stop(true);
		// 	} else if (queue.value[0]?.url !== newQueue[0]?.url) {
		// 		player.stop(true);
		// 		player.loadVideoByUrl(newQueue[0]);
		// 	}
		// } else {
		// 	if (newQueue.length > 0) {
		// 		player.loadVideoByUrl(newQueue[0]);
		// 	}
		// }

		queue.value = newQueue;
	};

	const setCurrent = (item: Song | null) => {
		const player = usePlayer();
		if (current.value?.id === item?.id) return;
		player.stop(true);
		current.value = item;
		if (item) player.loadVideoByUrl(item);
	};

	return { queue, add, remove, current, next, previous, setQueue, setCurrent };
});
