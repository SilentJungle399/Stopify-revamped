import { defineStore } from "pinia";

export default defineStore("auth", () => {
	const token = ref<string | undefined>(undefined);
	const user = ref<User | undefined>(undefined);

	const setAuth = (auth: { token: string; user: User }) => {
		token.value = auth.token;
		user.value = auth.user;
	};

	return { token, user, setAuth };
});
