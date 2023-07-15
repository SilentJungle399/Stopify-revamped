interface SongRequest {
	url: string;
}

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: string;
	refresh_token: string;
	scope: string;
}

interface UserData {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	global_name: string;
	permission: number;
}

interface PlayerState {
	playing: boolean;
	currentTime: number;
	volume: number;
	song: Song | null;
	queue: Song[];
	anonUsers?: number;
	knownUsers?: UserData[];
}
