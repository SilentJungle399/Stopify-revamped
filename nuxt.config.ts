// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	serverHandlers: [
		{
			route: "/ws",
			handler: "~/server-middleware/socket",
		},
	],
});
