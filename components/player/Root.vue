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
			<div
				class="control autoplay"
				@click="() => $io.emit('toggleAutoplay', token)"
				:style="`opacity: ${autoplay ? '1' : '0.5'};`"
			>
				<span class="material-symbols-outlined"> autoplay </span>
			</div>
			<div class="control previous" :style="`opacity: ${current ? '1' : '0.5'};`">
				<span class="material-symbols-outlined" @click="queueData.previous">
					skip_previous
				</span>
			</div>
			<div
				class="control playpause"
				id="playpause"
				:style="`opacity: ${current ? '1' : '0.5'};`"
			>
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
			<div class="control skip" :style="`opacity: ${current ? '1' : '0.5'};`">
				<span
					class="material-symbols-outlined"
					@click="() => $io.emit('queueUpdate', 'nextSong', token)"
				>
					skip_next
				</span>
			</div>
			<div class="control repeat" :style="`opacity: ${current ? '1' : '0.5'};`">
				<span
					class="material-symbols-outlined"
					@click="() => $io.emit('setLoop', token, loop === 1 ? 2 : 3)"
					v-if="loop === 1 || loop === 2"
					:style="`opacity: ${loop === 1 ? '0.5' : '1'}; transition: opacity 0.2s;`"
				>
					repeat
				</span>
				<span
					class="material-symbols-outlined"
					@click="() => $io.emit('setLoop', token, 1)"
					v-else-if="loop === 3"
				>
					repeat_one
				</span>
			</div>
		</div>
		<div class="extrabuttons">
			<PlayerVolume />
			<span class="control">
				<span
					class="material-symbols-outlined audiocontrol"
					@click="
						() => {
							switchTab('lyrics');
							$io.emit('lyricsRequest', current?.title);
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
const autoplay = computed(() => player.autoplay);
const loop = computed(() => player.loop);

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
	padding: 0 5px;
}

.control {
	cursor: pointer;
	margin: auto 5px;
	transition: all 0.2s;
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
