import { defineStore } from "pinia";

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

	const setUsers = ({ known, anon }: { known: UserData[]; anon: number }) => {
		knownUsers.value = known;
		anonUsers.value = anon;
	};

	return {
		knownUsers,
		anonUsers,
		addKnownUser,
		addAnonUser,
		removeKnownUser,
		removeAnonUser,
		setUsers,
	};
});
