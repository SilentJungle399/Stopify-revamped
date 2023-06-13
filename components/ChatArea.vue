<template>
	<div class="chat-area">
		<div class="login-box" v-if="!loggedIn">
			<button class="login" @click="login">Login via Discord</button>
		</div>
		<div v-else style="width: 100%; height: 100%; display: flex; flex-direction: column">
			<!-- <div class="chat">
				<div class="message" v-for="msg in msgs">
					<img
						:src="`https://cdn.discordapp.com/avatars/${msg.user.id}/${msg.user.avatar}`"
						alt=""
					/>
					<div class="message-content">
						<div class="message-details">
							<span class="author-name"> {{ msg.user.global_name }}</span>
							<span class="message-time">
								{{
									new Date(msg.timestamp).toLocaleString("en-US", {
										hour12: true,
									})
								}}</span
							>
						</div>
						<div class="message-text">{{ msg.content }}</div>
					</div>
				</div>
			</div>
			<input
				type="text"
				placeholder="Type your message"
				@keypress.enter="sendMessage"
				v-model="msgInput"
			/> -->

			<div style="margin: auto; font-family: Arial, Helvetica, sans-serif; font-size: 30px">
				Work in progress
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAuth, useChat } from "~/store";

const { $io } = useNuxtApp();

const auth = useAuth();
const chat = useChat();

const loggedIn = computed(() => !!auth.token);
const user = computed(() => auth.user);
const msgs = computed(() => chat.messages);
const msgInput = ref("");

const sendMessage = (e: KeyboardEvent) => {
	e.preventDefault();
	if (msgInput.value.trim().length > 0 && msgInput.value.trim().length < 200) {
		chat.sendMessage({ content: msgInput.value });
		msgInput.value = "";
	}
};

const login = () => {
	const params =
		"scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,\n" +
		"width=700,height=800,left=50%,top=50%";

	const url = `https://discord.com/api/oauth2/authorize?client_id=900755240532471888&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback&response_type=code&scope=identify`;

	const popup = window.open(url, "Discord Auth", params);

	const interval = setInterval(() => {
		popup?.postMessage("", "http://localhost:3000"); // Replace * with your origin
	}, 500);

	window.addEventListener(
		"message",
		(event) => {
			if (event.data.code) {
				clearInterval(interval);
				popup?.close();
				$io.emit(
					"validateLogin",
					event.data.code,
					({ data, token }: { data: UserData; token: string }) =>
						auth.setAuth({ token, user: data })
				);
			}
		},
		false
	);
};
</script>

<style scoped>
input {
	width: 85%;
	border: 1px solid white;
	border-radius: 6px;
	background-color: black;
	color: white;
	padding: 12.5px 20px;
	font-size: 20px;
	transition: 0.2s;
	margin: 20px auto;
}

input:focus {
	outline: none;
}

.chat {
	width: 100%;
	height: 100%;
	background: none;
	margin-top: 15px;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
}

.message {
	display: flex;
	margin: 10px 0;
}

.message img {
	width: 35px;
	height: 35px;
	border-radius: 50%;
	margin-right: 10px;
	margin-left: 30px;
}

.message-content {
	display: flex;
	flex-direction: column;
}

.message-details {
	display: flex;
}

.author-name {
	font-weight: bold;
	margin-right: 10px;
}

.message-time {
	color: gray;
}

.message-text {
	margin-top: 5px;
}

span {
	font-family: Arial, Helvetica, sans-serif;
}

.chat-area {
	display: flex;
	height: 100%;
	flex-direction: column;
}

.login-box {
	display: flex;
	margin: auto;
}

.login {
	height: 50px;
	border: 1px solid white;
	background-color: black;
	color: white;
	border-radius: 15px;
	padding: 0 20px;
	font-size: 20px;
	transition: 0.2s;
	cursor: pointer;
}

.login:hover {
	background-color: white;
	color: black;
}
</style>
