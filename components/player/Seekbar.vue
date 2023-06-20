<template>
	<div class="barcontainer">
		<div
			@click="seek"
			@mouseover="showPeg(true)"
			@mouseout="showPeg(false)"
			@mousedown="down"
			class="seekBar"
		>
			<div class="progress" :style="`width: ${seekbar.progress}%`"></div>
			<div
				id="peg"
				class="progresshandle"
				@mousedown="down"
				:style="`left: ${seekbar.progress}%; opacity: ${show ? 1 : 0}`"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts">
// export default {
// 	name: "SeekBar",
// 	props: {
// 		draggable: {
// 			requi#: true,
// 		},
// 	},
// }

import { useSeekbar } from "~/store";

const props = defineProps({
	draggable: {
		type: Boolean,
		required: true,
	},
});

const seekbar = useSeekbar();
const show = ref(false);
const lis = ref(false);

const mousemove = (event: MouseEvent) => {
	// $store.commit("progInc", (event.clientX * 100) / window.innerWidth);
	seekbar.setProgress((event.clientX * 100) / window.innerWidth);
};
const showPeg = (ev: boolean) => {
	if (!seekbar.dragging) {
		show.value = ev;
	}
};
const seek = (event: MouseEvent) => {
	if (!props.draggable) return;
	const perc = (event.clientX * 100) / window.innerWidth;

	// $emit("progressUpdate", perc);
	// $emit("seekAttempt", perc);
	seekbar.setProgress(perc);
};
const removelistener = (event: MouseEvent) => {
	if (!lis.value) return;
	window.removeEventListener("mousemove", mousemove);
	lis.value = false;
	const perc = (event.clientX * 100) / window.innerWidth;
	// $emit("seekAttempt", perc);
	seekbar.setDragging(false);
};
const down = (event: MouseEvent) => {
	if (props.draggable) {
		window.addEventListener("mousemove", mousemove);
		lis.value = true;
		window.addEventListener("mouseup", removelistener);
		seekbar.setDragging(true);
	}
};
</script>

<style>
.seekBar {
	background: #373a50;
	user-select: none;

	position: fixed;
	z-index: 1;
	bottom: 100px;
	left: 0;
	padding: 1px;

	width: 100%;
	height: 2px;
}

.seekBar:hover {
	cursor: pointer;
}

.progresshandle {
	user-select: none;
	display: block;
	position: absolute;
	z-index: 2;
	margin-top: -8px;
	margin-left: -10px;
	width: 10px;
	opacity: 0;
	transition: opacity 0.5s;
	height: 10px;
	border: 4px solid #494c60;
	border-top-color: #494c60;
	border-right-color: #494c60;
	border-radius: 100%;
	background-color: #494c60;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
	cursor: pointer;
}

.progress {
	background: #494c60;

	position: fixed;
	z-index: 1;
	bottom: 100px;
	left: 0;
	padding: 1px;

	height: 2px;
}
</style>
