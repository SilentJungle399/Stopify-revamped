import { defineStore } from "pinia";
import { useAuth } from ".";

export default defineStore("users", () => {
	const knownUsers = ref<UserData[]>([]);
	const anonUsers = ref<number>(0);

	const addKnownUser = (user: UserData) => {
		if (knownUsers.value.find((u) => u.id === user.id)) return;
		knownUsers.value.push(user);
	};

	const addAnonUser = (n: number = 1) => {
		anonUsers.value += n;
	};

	const removeKnownUser = (id: string) => {
		knownUsers.value = knownUsers.value.filter((u) => u.id !== id);
	};

	const removeAnonUser = (n: number = 1) => {
		anonUsers.value -= n;
	};

	return { knownUsers, anonUsers, addKnownUser, addAnonUser, removeKnownUser, removeAnonUser };
});
