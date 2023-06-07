<template>
	<main>
		<button
			:class="['queue', page === 'queue' ? 'active-btn' : '']"
			@click="switchTab('queue')"
		>
			Queue
		</button>
		<button
			:class="['lyrics', page === 'lyrics' ? 'active-btn' : '']"
			@click="switchTab('lyrics')"
		>
			Lyrics
		</button>
		<div class="display-area">
			<Queue v-if="page === 'queue'"></Queue>
		</div>
	</main>
</template>

<script setup lang="ts">
const page = ref("queue");

const switchTab = (tab: string) => {
	page.value = tab;
};
</script>

<style scoped>
main {
	position: absolute;
	top: 50px;
	left: 50px;
	height: calc(100vh - 225px);
	width: calc(100vw / 2 - 75px);
}

button {
	height: 50px;
	border: 1px solid white;
	background-color: black;
	color: white;
	padding: 0 20px;
	font-size: 20px;
	transition: 0.2s;
}

.queue {
	border-radius: 20px 0 0 0;
}

.lyrics {
	border-radius: 0 20px 0 0;
}

button:hover {
	background-color: white;
	color: black;
	cursor: pointer;
}

.active-btn {
	background-color: white;
	color: black;
}

.display-area {
	position: absolute;
	height: calc(100vh - 275px);
	width: calc(100vw / 2 - 75px);
	border: 1px solid white;
	border-radius: 20px;
	border-top-left-radius: 0;
}
</style>
