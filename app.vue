<template>
	<queue></queue>

	<PlayerSeekbar :draggable="!!true"></PlayerSeekbar>
	<PlayerRoot @switchTab="(tab: string) => (currTab = tab)"></PlayerRoot>

	<ChatArea v-if="currTab === 'chat'"></ChatArea>
	<Lyrics v-if="currTab === 'lyrics'"></Lyrics>
</template>

<script setup lang="ts">
import { useQueue, usePlayer, useChat, useUsers, useAuth } from "~/store";

const { $io } = useNuxtApp();

const queueData = useQueue();
const player = usePlayer();
const chat = useChat();
const users = useUsers();
const auth = useAuth();

const token = computed(() => auth.token);
const current = computed(() => queueData.current);
const playing = computed(() => player.playing);

const currTab = ref("chat");

const onYouTubeIframeAPIReady = () => {
	player.setYTplayer(
		// @ts-ignore
		new YT.Player("player", {
			height: "600",
			width: "600",
			playerVars: {
				autoplay: 1,
				controls: 0,
				autohide: 1,
				wmode: "opaque",
				origin: window.location.href,
			},
			events: player.events,
		})
	);
};

const login = () => {
	const token = localStorage.getItem("token");
	$io.emit("validateToken", token, (user: UserData | null) => {
		if (token && user) {
			auth.setAuth({ token, user });
			users.addKnownUser(user);
		} else if (!user) {
			users.addAnonUser();
		}
	});
};

onMounted(() => {
	// @ts-ignore
	window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

	const scriptTag = document.createElement("script");
	scriptTag.src = "https://www.youtube.com/iframe_api";
	const firstScriptTag = document.getElementsByTagName("script")[0];
	firstScriptTag.parentNode?.insertBefore(scriptTag, firstScriptTag);

	chat.loadMessages();
	$io.on("newIncomingMessage", (message: any) => {
		chat.addMessage(message);
	});

	$io.on("connect", login);

	$io.on("userJoin", (user: UserData | null) => {
		user ? users.addKnownUser(user) : users.addAnonUser();
	});

	$io.on("userLeave", (user: string | null) => {
		user ? users.removeKnownUser(user) : users.removeAnonUser();
	});

	$io.on("playerState", (state: PlayerState) => {
		console.log(state);

		queueData.setQueue(state.queue);
		queueData.setCurrent(state.song);

		if (!state.song && playing.value) {
			player.stop(true);
		}

		if (
			state.currentTime - 5 > player.currentTime() ||
			state.currentTime + 5 < player.currentTime()
		) {
			player.seek(state.currentTime, true);
			// player.play(undefined, true);
		}

		state.playing ? player.play(undefined, true) : player.pause(undefined, true);

		if (state.anonUsers || state.knownUsers) {
			users.setUsers({
				known: state.knownUsers || [],
				anon: state.anonUsers || 0,
			});
		}
	});

	$io.emit(
		"roomUsersRequest",
		({ userlist, anonUsers }: { userlist: UserData[]; anonUsers: number }) => {
			users.setUsers({
				known: userlist,
				anon: anonUsers,
			});
		}
	);

	setInterval(() => {
		chat.reorder();
	}, 5000);
});
</script>

<style>
body {
	background-color: #151729;
	color: white;
	user-select: none;
}

::-webkit-scrollbar {
	width: 7px;
	height: 7px;
}

/* Track */
::-webkit-scrollbar-track {
	background: transparent;
	border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: #373a50;
	border-radius: 10px;
}
</style>
