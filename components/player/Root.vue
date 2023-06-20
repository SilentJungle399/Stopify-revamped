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
					@click="() => $io.emit('queueUpdate', 'addSong', token, song)"
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
				<span class="material-symbols-outlined audiocontrol"> lyrics </span>
			</span>
			<span class="control">
				<span class="material-symbols-outlined audiocontrol"> forum </span>
			</span>
			<span class="control">
				<span class="material-symbols-outlined audiocontrol" style="cursor: default">
					group
				</span>
			</span>
		</div>
	</div>
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

const song: Song = {
	addedBy: "bruh",
	artist: "bruh",
	duration: "3:00",
	id: "bruh" + Date.now(),
	thumbnail: "https://i.ytimg.com/vi/ox4tmEV6-QU/hq720.jpg",
	title: "bruh",
	url: "https://www.youtube.com/watch?v=ox4tmEV6-QU",
	views: 0,
};
</script>

<style>
.playersection {
	background-color: #1c1f34;
	position: absolute;
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
