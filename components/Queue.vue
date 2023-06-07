<template>
	<div class="results-section">
		<div class="queue-result" v-for="song in queue">
			<div class="queue-result-thumbnail">
				<img :src="song.thumbnail" />
			</div>
			<div class="queue-result-desc">
				<div class="queue-result-title">{{ song.title }}</div>
				<div class="queue-result-artist">{{ song.artist }} (Added by {{ "Silent" }})</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useQueue } from "~/store";

const queueDate = useQueue();
const queue = computed(() => queueDate.queue);
</script>

<style>
.results-section {
	display: flex;
	width: 100%;
	flex-direction: column;
	margin: 20px auto 20px auto;
	overflow-y: auto;
	height: -webkit-fill-available;
	user-select: none;
}

.queue-result {
	display: flex;
	width: 90%;
	margin: 20px auto;
}

img {
	height: 50px;
}

.queue-result-desc {
	margin-left: 20px;
	font-family: Arial, Helvetica, sans-serif;
}

.queue-result-title {
	font-size: 17px;
}

.queue-result-artist {
	font-size: 15px;
	color: gray;
	margin-top: 5px;
}
</style>
