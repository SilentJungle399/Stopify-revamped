import { defineStore } from "pinia";
import { useAuth } from "..";

export default defineStore("chat", () => {
	const { $io } = useNuxtApp();

	const auth = useAuth();

	const messages = ref<Message[]>([]);

	const reorder = () => {
		messages.value.sort((a, b) => a.timestamp - b.timestamp);
	};

	const addMessage = (message: Message) => {
		messages.value.push(message);
		reorder();
	};

	const sendMessage = (message: PartialMessage) => {
		$io.emit("newMessage", { message, token: auth.token });
	};

	const loadMessages = () => {
		$io.emit(
			"loadMessages",
			{
				timestamp: messages.value[0]?.timestamp,
				token: auth.token ?? localStorage.getItem("token"),
			},
			(data: Message[]) => {
				data.forEach((message) => {
					if (!messages.value.find((m) => m.id === message.id)) {
						addMessage(message);
					}
				});
				setTimeout(() => {
					const elem = document.getElementById("chat");
					if (elem) {
						elem.scrollTop = elem.scrollHeight;
					}
				}, 2000);
			}
		);
	};

	return { messages, addMessage, sendMessage, loadMessages, reorder };
});
