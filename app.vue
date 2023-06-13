<template>
	<queue-section></queue-section>
	<other-section></other-section>
	<div class="player-section">
		<div id="player" style="display: none"></div>
		<div class="song-details" v-if="current">
			<img :src="current.thumbnail" alt="" />
			<div class="song-description">
				<div class="song-title" :title="current.title">
					{{
						current.title.length > 50
							? current.title.slice(0, 50) + "..."
							: current.title
					}}
				</div>
				<div class="song-artist" :title="current.artist">
					{{
						current.artist.length > 50
							? current.artist.slice(0, 50) + "..."
							: current.artist
					}}
				</div>
			</div>
		</div>

		<div class="audio-controls">
			<div class="controls">
				<div class="control previous">
					<span class="material-symbols-outlined" @click="queueData.previous">
						skip_previous
					</span>
				</div>
				<div class="control playpause">
					<span
						class="material-symbols-outlined"
						style="font-size: 45px"
						v-if="playing"
						@click="player.pause"
					>
						pause_circle
					</span>
					<span
						class="material-symbols-outlined"
						style="font-size: 45px"
						v-else
						@click="player.play"
					>
						play_circle
					</span>
				</div>
				<div class="control skip">
					<span class="material-symbols-outlined" @click="queueData.next">
						skip_next
					</span>
				</div>
			</div>
			<div class="seekbar">
				<div class="progress" id="progress"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useQueue, usePlayer, useChat, useUsers, useAuth } from "~/store";
import callback from "./server/api/callback";

const { $io } = useNuxtApp();

const queueData = useQueue();
const player = usePlayer();
const chat = useChat();
const users = useUsers();
const auth = useAuth();

const current = computed(() => queueData.current());
const playing = computed(() => player.playing);

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
				origin: "http://localhost:3000",
			},
			events: player.events,
		})
	);
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

	const token = localStorage.getItem("token");
	$io.emit("validateToken", token, (user: UserData | null) => {
		if (token && user) {
			auth.setAuth({ token, user });
			users.addKnownUser(user);
		} else if (!user) {
			users.addAnonUser();
		}
	});

	$io.on("userJoin", (user: UserData | null) => {
		user ? users.addKnownUser(user) : users.addAnonUser();
	});

	$io.on("userLeave", (user: string | null) => {
		user ? users.removeKnownUser(user) : users.removeAnonUser();
	});

	$io.emit(
		"roomUsersRequest",
		({ userlist, anonUsers }: { userlist: UserData[]; anonUsers: number }) => {
			userlist.forEach((user) => {
				users.addKnownUser(user);
			});
			users.addAnonUser(anonUsers);
		}
	);

	setInterval(() => {
		chat.reorder();
	}, 5000);
});
</script>

<style>
body {
	background-color: black;
	color: white;
	user-select: none;
}

.player-section {
	position: absolute;
	bottom: 50px;
	right: 50px;
	height: 100px;
	width: calc(100vw - 100px);
	border: 1px solid white;
	border-radius: 20px;
	display: flex;
}

.song-details {
	display: flex;
	position: absolute;
	margin-left: 20px;
	top: 20px;
}

.song-details img {
	height: 60px;
	margin: auto 0;
}

.song-description {
	margin: auto 0;
	margin-left: 20px;
	font-family: Arial, Helvetica, sans-serif;
}

.song-title {
	font-size: 17px;
}

.song-artist {
	margin-top: 5px;
	color: gray;
	font-size: 15px;
}

.controls {
	display: flex;
	margin: auto;
}

.control {
	cursor: pointer;
	margin: auto 5px;
}

.audio-controls {
	margin: auto;
	display: flex;
	flex-direction: column;
}

.seekbar {
	width: 500px;
	height: 3px;
	border: 0.5px solid white;
	border-radius: 10px;
	margin: auto;
}

.progress {
	display: block;
	width: 0%;
	height: 100%;
	background: white;
	border-radius: 10px;
	transition: width 0.1s ease-in-out;
}

::-webkit-scrollbar {
	width: 7px;
	height: 7px;
}

/* Track */
::-webkit-scrollbar-track {
	background: black;
	border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: white;
	border-radius: 10px;
}
</style>
