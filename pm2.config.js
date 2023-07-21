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
			name: "ytmusic-server",
			script: "ytmusic/main.py",
			interpreter: "python3",
		},
	],
};
