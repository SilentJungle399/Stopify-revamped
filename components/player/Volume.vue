<template>
	<div class="control volume" @mouseover="mouseover" ref="volumeDiv" style="margin: auto 0">
		<div class="audiocontrol" style="display: flex">
			<input
				type="range"
				name="vol"
				id=""
				v-model="volume"
				class="volumeRange"
				style="transition: 0.2s; opacity: 0; accent-color: #9899a5; margin: auto 10px"
				ref="volumeRange"
			/>
			<span class="material-symbols-outlined">
				{{
					volume > 66
						? "volume_up"
						: volume > 33
						? "volume_down"
						: volume > 0
						? "volume_mute"
						: "volume_off"
				}}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { usePlayer } from "~/store";

const player = usePlayer();

const volume = ref(100);
const showRange = ref(false);
const volumeDiv = ref<HTMLElement>();
const volumeRange = ref<HTMLInputElement>();

watch(
	volume,
	() => {
		player.setVolume(volume.value);
	},
	{ immediate: true }
);

onMounted(() => {
	window.addEventListener("mousemove", mousemove);
});

onUnmounted(() => {
	window.removeEventListener("mousemove", mousemove);
});

const mouseover = () => {
	showRange.value = true;
	volumeRange.value!.style.opacity = "1";
};

const mousemove = (event: MouseEvent) => {
	if (!volumeDiv.value || !volumeRange.value) return;

	const distanceX =
		event.clientX -
		(volumeDiv.value.getBoundingClientRect().left! + volumeDiv.value.offsetWidth! / 2);
	const distanceY =
		event.clientY -
		(volumeDiv.value.getBoundingClientRect().top! + volumeDiv.value.offsetHeight! / 2);

	const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

	if (distance > 100) {
		volumeRange.value.style.opacity = "0";
		setTimeout(() => {
			showRange.value = false;
		}, 200);
	}
};
</script>

<style>
.volumeRange {
	height: 5px;
	transition: opacity 0.2s;
	outline: none;
}

.volumeRange::-webkit-slider-runnable-track {
	border: none;
	outline: none;
}
</style>
