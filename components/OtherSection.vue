<template>
	<main>
		<button
			:class="['youtube', page === 'youtube' ? 'active-btn' : '']"
			@click="switchTab('youtube')"
		>
			Youtube
		</button>
		<button :class="['chat', page === 'chat' ? 'active-btn' : '']" @click="switchTab('chat')">
			Chat
		</button>
		<button
			:class="['users', page === 'users' ? 'active-btn' : '']"
			@click="switchTab('users')"
		>
			Users
		</button>
		<div class="display-area">
			<YoutubeSearch v-if="page === 'youtube'"></YoutubeSearch>
			<ChatArea v-if="page === 'chat'"></ChatArea>
		</div>
	</main>
</template>

<script setup lang="ts">
const page = ref("youtube");

const switchTab = (tab: string) => {
	page.value = tab;
};
</script>

<style scoped>
main {
	position: absolute;
	top: 50px;
	right: 50px;
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

.youtube {
	border-radius: 20px 0 0 0;
}

.chat {
	border-radius: 0 0 0 0;
}

.users {
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
	display: flex;
	flex-direction: column;
}
</style>
