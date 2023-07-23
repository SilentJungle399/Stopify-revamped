<template>
	<div class="chat-area">
		<div class="login-box" v-if="!loggedIn">
			<button class="login" @click="login">Login via Discord</button>
		</div>
		<div v-else style="width: 100%; height: 100%; display: flex; flex-direction: column">
			<div class="chat" id="chat">
				<div class="message" v-for="msg in msgs">
					<img
						:src="`https://cdn.discordapp.com/avatars/${msg.user.id}/${msg.user.avatar}`"
						alt=""
						v-if="msg.user.id !== '0'"
					/>
					<div
						class="message-content"
						:style="
							msg.user.id === '0'
								? `background-color: #202339; margin-left: 30px; height: 30px; border-radius: 5px; `
								: ''
						"
					>
						<div class="message-details" v-if="msg.user.id !== '0'">
							<span class="author-name"> {{ msg.user.global_name }}</span>
							<span class="message-time"> {{ formatDate(msg.timestamp) }}</span>
						</div>
						<div
							class="message-text"
							:style="
								msg.user.id === '0'
									? `margin: auto; font-size: small; color: gray;`
									: ''
							"
						>
							{{ msg.content }}
						</div>
					</div>
				</div>
			</div>
			<input
				type="text"
				placeholder="Type your message"
				@keypress.enter="sendMessage"
				v-model="msgInput"
				v-if="loggedIn && user?.permission !== 2"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAuth, useChat } from "~/store";
import moment from "moment";

const { $io } = useNuxtApp();

const auth = useAuth();
const chat = useChat();

const loggedIn = computed(() => !!auth.token);
const user = computed(() => auth.user);
const msgs = computed(() => chat.messages);
const msgInput = ref("");

const formatDate = (timestamp: number) => {
	return moment(timestamp).calendar();
};

onMounted(() => {
	const elem = document.getElementById("chat");
	if (elem) {
		elem.scrollTop = elem.scrollHeight;
	}
	setTimeout(() => {
		const elem = document.getElementById("chat");
		if (elem && elem.scrollHeight === 0) {
			elem.scrollTop = elem.scrollHeight;
		}
	}, 2000);
	$io.on("newIncomingMessage", (message: any) => {
		const elem = document.getElementById("chat");
		if (elem && elem.scrollHeight - (elem.scrollTop + elem.clientHeight) < 400) {
			setTimeout(() => {
				elem.scrollTop = elem.scrollHeight;
			}, 100);
		}
	});
});

const sendMessage = (e: KeyboardEvent) => {
	e.preventDefault();
	if (msgInput.value.trim().length > 0 && msgInput.value.trim().length < 200) {
		chat.sendMessage({ content: msgInput.value });
		msgInput.value = "";
	}
};

const login = async () => {
	const url = window.location.href.includes("silentjungle.me")
		? "https://discord.com/api/oauth2/authorize?client_id=900755240532471888&redirect_uri=https%3A%2F%2Fstopify.silentjungle.me%2Fapi%2Fcallback&response_type=code&scope=identify"
		: "https://discord.com/api/oauth2/authorize?client_id=900755240532471888&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback&response_type=code&scope=identify";

	const urlresp = window.location.href.includes("silentjungle.me")
		? "https://stopify.silentjungle.me"
		: "http://localhost:3000";

	const params =
		"scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,\n" +
		"width=700,height=800,left=50%,top=50%";

	// @ts-ignore
	const electron = window.electron;
	if (electron) {
		window.open(`${urlresp}/api/auth/${$io.id}`, "Discord Auth", params);
	} else {
		const popup = window.open(url, "Discord Auth", params);

		const interval = setInterval(() => {
			popup?.postMessage("", urlresp);
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
						({ data, token }: { data: UserData; token: string }) => {
							localStorage.setItem("token", token);
							auth.setAuth({ token, user: data });
						}
					);
				}
			},
			false
		);
	}
};
</script>

<style scoped>
input {
	border: none;
	border-radius: 6px;
	background-color: #202339;
	color: white;
	padding: 12.5px 20px;
	font-size: 20px;
	transition: 0.2s;
	margin: 20px 20px;
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
	padding-right: 25px;
	margin: 15px 0;
}

.message img {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	margin-right: 15px;
	margin-left: 30px;
}

.message-content {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.message-details {
	display: flex;
}

.author-name {
	margin-right: 10px;
}

.message-time {
	color: gray;
	font-size: small;
	vertical-align: bottom;
	margin-top: auto;
}

.message-text {
	margin-top: 5px;
	font-family: Arial, Helvetica, sans-serif;
}

span {
	font-family: Arial, Helvetica, sans-serif;
}

.chat-area {
	display: flex;
	width: calc(100% - 400px);
	height: calc(100% - 105px);
	flex-direction: column;
	position: fixed;
	top: 0;
	left: 400px;
}

.login-box {
	display: flex;
	margin: auto;
}

.login {
	height: 50px;
	border: 1px solid var(--border-color);
	background-color: #1c1f34;
	color: white;
	border-radius: 7.5px;
	padding: 0 20px;
	font-size: 20px;
	transition: 0.2s;
	cursor: pointer;
}

.login:hover {
	background-color: #23263e;
}
</style>
