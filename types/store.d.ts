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

interface User {
	id: string;
	username: string;
	pfp: string;
	token: string;
}
