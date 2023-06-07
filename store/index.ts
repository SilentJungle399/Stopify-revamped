import { defineStore } from "pinia";

export const useQueue = defineStore("queue", () => {
	const queue = ref<Song[]>([]);
	const add = (item: Song) => queue.value.push(item);
	const remove = (item: Song) => {
		const index = queue.value.indexOf(item);
		if (index > -1) queue.value.splice(index, 1);
	};
	const current = () => queue.value[0];
	const next = () => queue.value.shift();
	const clear = () => queue.value.splice(0, queue.value.length);

	return { queue, add, remove, current, next, clear };
});
