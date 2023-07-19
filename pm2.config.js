module.exports = {
	apps: [
		{
			name: "Stopify",
			script: ".output/server/index.mjs",
			env: {
				NODE_ENV: "production",
				NITRO_PORT: "25691",
			},
		},
		{
			name: "lyrics-server",
			script: "lyrics_server.py",
			interpreter: "python3",
		},
	],
};
