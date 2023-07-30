<template>
	<div class="lyrics-area">
		<div class="lyrics">
			<span
				class="lyrics-line"
				v-for="line in props.lyrics"
				v-if="props.lyrics.length > 0"
				:style="`color: ${
					line.startTimeMs < progress && progress <= line.endTimeMs ? 'white' : ''
				}`"
				:id="
					line.startTimeMs < progress && progress <= line.endTimeMs
						? 'active-lyrics'
						: props.lyrics.indexOf(line).toString()
				"
				@click="() => seek(line)"
			>
				{{ line.words }}<br />
			</span>
			<span v-else> No lyrics found. </span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useQueue, usePlayer } from "~/store";

const queue = useQueue();
const player = usePlayer();

const current = computed(() => queue.current);
const progress = computed(() => Math.round(player.progress * 1000));

const props = defineProps({
	lyrics: {
		type: Array as PropType<LyricsLine[]>,
		required: true,
	},
});

const parseDuration = (duration: string) => {
	const parts = duration.split(":");
	return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

const seek = (line: LyricsLine) => {
	player.seek((line.startTimeMs + 100) / 10 / parseDuration(current.value?.duration ?? "0:01"));
};

watch(
	progress,
	() => {
		const elem = document.getElementById("active-lyrics");
		const { top } = elem?.getBoundingClientRect() ?? { top: null };
		if (top && Math.abs(window.innerHeight / 2 - top) < 100) {
			elem?.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center",
			});
		}
	},
	{ immediate: true }
);

watch(
	() => props.lyrics,
	() => {
		const elem = document.getElementById("active-lyrics");
		elem?.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center",
		});
	}
);

onMounted(() => {
	const elem = document.getElementById("active-lyrics");
	elem?.scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "center",
	});
});
</script>

<style>
.lyrics-area {
	display: flex;
	width: calc(100% - 400px);
	height: calc(100% - 105px);
	flex-direction: column;
	position: fixed;
	top: 0;
	left: 400px;
	overflow-y: auto;
}

.lyrics {
	text-align: center;
	font-size: 30px;
	line-height: 55px;
	font-family: Arial, Helvetica, sans-serif;
	margin: 50px auto;
}

.lyrics-line {
	transition: all 0.1s;
	cursor: pointer;
	color: gray;
}

.lyrics-line:hover {
	color: white;
}
</style>
