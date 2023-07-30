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
	song: Song | null;
	queue: Song[];
	autoplay: boolean;
	loop: 1 | 2 | 3;

	anonUsers?: number;
	knownUsers?: UserData[];
}

interface Song {
	title: string;
	artist: string;
	thumbnail: string;
	url: string;
	duration: string;
	views: number;
	addedBy: string | null;
	id: string;
	type?: "video" | "song";
	category?: string;
}

interface PartialMessage {
	content: string;
}

interface Message extends PartialMessage {
	id: string;
	content: string;
	timestamp: number;
	user: UserData;
}

interface LyricsLine {
	startTimeMs: number;
	words: string;
	syllables: any[];
	endTimeMs: number;
}
