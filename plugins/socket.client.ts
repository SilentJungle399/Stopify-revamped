import { io } from "socket.io-client";

const socket = io(window.location.href.includes("silentjungle.me") ? "" : "http://localhost:3003");

export default defineNuxtPlugin(() => {
	return {
		provide: {
			io: socket,
		},
	};
});
