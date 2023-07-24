export default defineEventHandler(async (event) => {
	const url =
		process.env.NODE_ENV === "production"
			? "https://discord.com/api/oauth2/authorize?client_id=900755240532471888&redirect_uri=https%3A%2F%2Fstopify.silentjungle.me%2Fapi%2Fcallback&response_type=code&scope=identify"
			: "https://discord.com/api/oauth2/authorize?client_id=900755240532471888&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback&response_type=code&scope=identify";

	const urlresp = process.env.NODE_ENV === "production" ? "" : "http://localhost:3003";
	const sockId = event.path.split("/").pop();

	return `
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Electron auth</title>
	<script src="https://cdn.socket.io/4.6.0/socket.io.min.js" integrity="sha384-c79GN5VsunZvi+Q/WObgk2in0CbZsHnjEqvFxC5DxHn9lTfNce2WW6h2pH6u/kF+" crossorigin="anonymous"></script>
</head>

<body>
	<script>
		const token = localStorage.getItem("token");
		if (token) {
			const socket = io("${urlresp}");
			socket.on("connect", () => {
				socket.emit("electron-auth", {
					token: token,
					sockId: "${sockId}"
				},
				() => {
					window.close()
				});
			})
		} else {
			localStorage.setItem("electron-auth", "${sockId}");
			window.location.href = "${url}"
		}
	</script>
</body>
`;
});
