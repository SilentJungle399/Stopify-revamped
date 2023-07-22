<template>
	<div class="userlist">
		<div class="user" v-for="user in knownUsers">
			<img :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`" alt="" />
			<div class="user-details">
				<div class="user-name">
					{{ user.global_name }} {{ self?.id === user.id ? " (You)" : "" }}
				</div>
				<div class="user-permission">
					{{
						{
							1: "Admin",
							2: "Chat perms",
							3: "Listener",
						}[user.permission]
					}}
				</div>
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

const { $io } = useNuxtApp();

const users = useUsers();
const auth = useAuth();

const self = computed(() => auth.user);
const knownUsers = computed(() => users.knownUsers);
const anonUsers = computed(() => users.anonUsers);
onMounted(() => {
	$io.emit(
		"roomUsersRequest",
		({ userlist, anonUsers }: { userlist: UserData[]; anonUsers: number }) => {
			users.setUsers({
				known: userlist,
				anon: anonUsers,
			});
		}
	);
});
</script>

<style>
.userlist {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	min-height: 300px;
	max-height: 700px;
	position: absolute;
	bottom: 75px;
	right: 20px;
	box-shadow: 0px 0px 15px 0px #15171d;
	background-color: #202339;
	z-index: 20;
	transition: 0.2s;
	border-radius: 7.5px;
}

.user {
	display: flex;
	align-items: center;
	padding: 10px;
	margin: 10px 20px;
	padding-bottom: 0;
	font-family: Arial, Helvetica, sans-serif;
}

.user img {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}

.user-details {
	margin-left: 10px;
}

.user-name {
	font-size: 17px;
}

.user-permission {
	font-size: 13px;
	color: gray;
}

.pfp {
	width: 40px;
	height: 40px;
	font-size: 20px;
	font-family: Arial, Helvetica, sans-serif;
	border-radius: 50%;
	background-color: gray;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
