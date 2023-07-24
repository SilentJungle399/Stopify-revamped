export default defineEventHandler(async (event) => {
	const urlresp = process.env.NODE_ENV === "production" ? "" : "http://localhost:3003";
	return `
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>OAuth Callback</title>
	<script src="https://cdn.socket.io/4.6.0/socket.io.min.js" integrity="sha384-c79GN5VsunZvi+Q/WObgk2in0CbZsHnjEqvFxC5DxHn9lTfNce2WW6h2pH6u/kF+" crossorigin="anonymous"></script>

</head>
<body>
	Authorizing...	

    <script>
		const electron = localStorage.getItem("electron-auth");
		if (!electron) {
			window.addEventListener("message", (event) => {
				event.source.postMessage(
					{
						code: new URLSearchParams(window.location.search).get('code')
					},
					event.origin
				);
			});
		} else {
			const socket = io("${urlresp}");
			localStorage.removeItem("electron-auth");
			socket.on("connect", () => {
				socket.emit(
					"validateLogin",
					new URLSearchParams(window.location.search).get('code'),
					({ token }) => {
						localStorage.setItem("token", token);
						socket.emit("electron-auth", {
							token: token,
							sockId: electron
						},
						() => {
							window.close()
						});
					}
				);
			});
		}
    </script>
</body>
</html>
	`;
});
