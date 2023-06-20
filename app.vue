<template>
	<queue></queue>

	<PlayerSeekbar :draggable="!!true"></PlayerSeekbar>
	<PlayerRoot></PlayerRoot>
	<!--<other-section></other-section>
	<div class="player-section">
		<div id="player" style="display: none"></div>
		<div class="song-details" v-if="current">
			<img :src="current.thumbnail" alt="" />
			<div class="song-description">
				<div class="song-title" :title="current.title">
					{{
						current.title.length > 35
							? current.title.slice(0, 35) + "..."
							: current.title
					}}
				</div>
				<div class="song-artist" :title="current.artist">
					{{
						current.artist.length > 35
							? current.artist.slice(0, 35) + "..."
							: current.artist
					}}
					(Added by {{ current.addedBy ?? "Unknown" }})
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
				<div class="control playpause" id="playpause">
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
					<span
						class="material-symbols-outlined"
						@click="() => $io.emit('queueUpdate', 'nextSong', token)"
					>
						skip_next
					</span>
				</div>
			</div>
			<div class="seekbar">
				<div class="progress" id="progress"></div>
			</div>
		</div>
	</div> -->
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
				origin: window.location.href,
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

	$io.on("playerState", (state: PlayerState) => {
		queueData.setQueue(state.queue);

		if (!state.song && playing.value) {
			player.stop(true);
		}

		state.playing ? player.play(undefined, true) : player.pause(undefined, true);
		if (
			state.currentTime - 5 > player.currentTime() ||
			state.currentTime + 5 < player.currentTime()
		) {
			player.seek(state.currentTime, true);
			player.play(undefined, true);
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
