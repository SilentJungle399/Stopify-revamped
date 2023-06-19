<template>
	<main>
		<button
			:class="['youtube', page === 'youtube' ? 'active-btn elevated' : '']"
			@click="switchTab('youtube')"
		>
			Youtube
		</button>
		<button
			:class="['chat', page === 'chat' ? 'active-btn elevated' : '']"
			@click="switchTab('chat')"
		>
			Chat
		</button>
		<button
			:class="['users', page === 'users' ? 'active-btn elevated' : '']"
			@click="switchTab('users')"
		>
			Users
		</button>
		<div class="display-area elevated">
			<YoutubeSearch v-if="page === 'youtube'"></YoutubeSearch>
			<ChatArea v-if="page === 'chat'"></ChatArea>
			<UserList v-if="page === 'users'"></UserList>
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
	border: 1px solid var(--border-color);
	background-color: var(--secondary-color);
	color: white;
	padding: 0 20px;
	font-size: 20px;
	transition: 0.2s;
	clip-path: inset(-100px -100px 0px -100px);
	position: relative;
	border-radius: 20px 20px 0 0;
}
/* 
.youtube {
	border-radius: 20px 0 0 0;
}

.chat {
	border-radius: 0 0 0 0;
}

.users {
	border-radius: 0 20px 0 0;
} */

.active-btn:before,
.active-btn:after {
	content: "";
	position: absolute;
	color: var(--primary-color);
	/* background-color: var(--primary-color); */
	top: 30px;
	width: 20px;
	height: 20px;
	border-top: 20px solid;
	rotate: 180deg;
}
.active-btn:before {
	right: calc(100% - 4px);
	border-left: 4px solid;
	border-top-left-radius: 100%;
}
.active-btn:after {
	left: calc(100% - 4px);
	border-right: 4px solid;
	border-top-right-radius: 100%;
}

button:hover {
	background-color: var(--primary-color);
	/* color: black; */
	cursor: pointer;
}

.active-btn {
	background-color: var(--primary-color);
	/* color: black; */
	z-index: 20;
}

.display-area {
	position: absolute;
	height: calc(100vh - 275px);
	width: calc(100vw / 2 - 75px);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	/* border-top-left-radius: 0; */
	display: flex;
	flex-direction: column;
	background: var(--primary-color);
}

.elevated {
	box-shadow: 0px 0px 16px 0px rgb(0 0 0 / 20%);
}
</style>
