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
