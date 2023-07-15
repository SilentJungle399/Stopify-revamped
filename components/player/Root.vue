<template>
	<div class="playersection">
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
		<div class="extrabuttons">
			<span class="control">
				<span
					class="material-symbols-outlined audiocontrol"
					@click="
						() => {
							switchTab('lyrics');
							$io.emit('lyricsRequest', current?.url);
						}
					"
				>
					lyrics
				</span>
			</span>
			<span class="control">
				<span
					class="material-symbols-outlined audiocontrol"
					@click="() => switchTab('chat')"
				>
					forum
				</span>
			</span>
			<span class="control">
				<span
					class="material-symbols-outlined audiocontrol"
					style="cursor: default"
					@mouseover="hovering = true"
					@mouseleave="hovering = false"
				>
					group
				</span>
			</span>
		</div>
	</div>
	<UserList
		:style="`opacity: ${hovering ? '1' : '0'}; z-index: ${hovering ? '20' : '-1'}`"
	></UserList>
</template>

<script setup lang="ts">
import { useQueue, usePlayer, useChat, useUsers, useAuth } from "~/store";

const { $io } = useNuxtApp();

const queueData = useQueue();
const player = usePlayer();
const auth = useAuth();

const token = computed(() => auth.token);
const current = computed(() => queueData.current);
const playing = computed(() => player.playing);

const emits = defineEmits(["switchTab"]);
const hovering = ref(false);

const switchTab = (tab: string) => {
	emits("switchTab", tab);
};
</script>

<style>
.playersection {
	background-color: #1c1f34;
	position: fixed;
	display: flex;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 100px;
}

.controls {
	display: flex;
	margin: auto;
}

.control {
	cursor: pointer;
	margin: auto 5px;
}

.audiocontrol {
	padding: 10px;
	transition: all 0.5s;
	border-radius: 50%;
	font-size: 20px;
}

.extrabuttons {
	position: absolute;
	bottom: 30px;
	right: 20px;
	margin: auto;
	display: flex;
}

.audiocontrol:hover {
	color: white !important;
}

.extrabuttons:hover > .control > .audiocontrol {
	color: gray;
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
</style>
