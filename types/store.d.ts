interface Song {
	title: string;
	artist: string;
	thumbnail: string;
	url: string;
	duration: string;
	views: number;
	addedBy: string | null;
	id: string;
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
