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
import { useSeekbar, useAuth } from "~/store";

const props = defineProps({
	draggable: {
		type: Boolean,
		required: true,
	},
});

const seekbar = useSeekbar();
const auth = useAuth();
const { $io } = useNuxtApp();

const token = computed(() => auth.token);
const show = ref(false);
const lis = ref(false);

const mousemove = (event: MouseEvent) => {
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

	$io.emit("seekSong", token.value, perc);
	seekbar.setProgress(perc);
};
const removelistener = (event: MouseEvent) => {
	console.log(lis.value);
	if (!lis.value) return;
	window.removeEventListener("mousemove", mousemove);
	lis.value = false;
	const perc = (event.clientX * 100) / window.innerWidth;
	$io.emit("seekSong", token.value, perc);
	setTimeout(() => {
		seekbar.setDragging(false);
	}, 500);
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
	z-index: 200;
	margin-top: -8px;
	margin-left: -10px;
	width: 10px;
	opacity: 0;
	transition: opacity 0.5s;
	height: 10px;
	border: 4px solid #9899a5;
	border-top-color: #9899a5;
	border-right-color: #9899a5;
	border-radius: 100%;
	background-color: #9899a5;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
	cursor: pointer;
}

.progress {
	background: #9899a5;
	position: fixed;
	z-index: 1;
	bottom: 100px;
	left: 0;
	padding: 1px;
	height: 2px;
}
</style>
