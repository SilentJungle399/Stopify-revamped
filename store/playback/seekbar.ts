import { defineStore } from "pinia";

export default defineStore("seekbar", () => {
	const progress = ref(0);
	const dragging = ref(false);

	const setProgress = (value: number) => {
		progress.value = value;
	};

	const setDragging = (value: boolean) => {
		dragging.value = value;
	};

	return {
		progress,
		setProgress,
		dragging,
		setDragging,
	};
});
