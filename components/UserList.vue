<template>
	<div class="userlist">
		<div class="user" v-for="user in knownUsers">
			<img :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`" alt="" />
			<div class="user-details">
				<div class="user-name">
					{{ user.global_name }} {{ self?.id === user.id ? " (You)" : "" }}
				</div>
				<div class="user-permission">Admin</div>
			</div>
		</div>
		<div class="user" v-if="anonUsers > 0">
			<div class="pfp">+{{ anonUsers }}</div>
			<div class="user-details">
				<div class="user-name">Anonymous User</div>
				<div class="user-permission">Listener</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useUsers, useAuth } from "~/store";

const users = useUsers();
const auth = useAuth();

const self = computed(() => auth.user);
const knownUsers = computed(() => users.knownUsers);
const anonUsers = computed(() => users.anonUsers);
</script>

<style>
.userlist {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	height: 100%;
	margin-top: 20px;
}

.user {
	display: flex;
	align-items: center;
	padding: 10px;
	margin: 0 20px;
	font-family: Arial, Helvetica, sans-serif;
}

.user img {
	width: 50px;
	height: 50px;
	border-radius: 50%;
}

.user-details {
	margin-left: 10px;
}

.user-name {
	font-size: 20px;
}

.user-permission {
	font-size: 15px;
	color: gray;
}

.pfp {
	width: 50px;
	height: 50px;
	font-size: 20px;
	font-family: Arial, Helvetica, sans-serif;
	border-radius: 50%;
	background-color: gray;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
