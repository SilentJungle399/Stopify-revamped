// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	serverHandlers: [
		{
			route: "/ws",
			handler: "~/server-middleware/socket",
		},
	],
	modules: ["@pinia/nuxt"],
	app: {
		head: {
			link: [
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0",
				},
				{
					rel: "stylesheet",
					href: "/theme.css",
				},
			],
			title: "Stopify",
		},
	},
	ssr: false,
});
