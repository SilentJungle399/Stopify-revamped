<template>
	<div class="chat-area">
		<div class="login-box">
			<button class="login" @click="login">Login via Discord</button>
		</div>
	</div>
</template>

<script setup lang="ts">
const { $io } = useNuxtApp();

const login = () => {
	const clientId = "900755240532471888";
	const redirectUrl = "http://localhost:3000/api/callback";
	const scopes = "identify";

	const params =
		"scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,\n" +
		"width=700,height=800,left=50%,top=50%";

	const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${scopes}`;

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
				$io.emit("validateLogin", event.data.code, (resp: string) =>
					localStorage.setItem("token", resp)
				);
			}
		},
		false
	);
};
</script>

<style>
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
