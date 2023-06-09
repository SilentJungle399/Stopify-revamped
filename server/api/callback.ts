export default defineEventHandler(async (event) => {
	return `
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>OAuth Callback</title>

</head>
<body>
	Authorizing...	

    <script>
        window.addEventListener("message", (event) => {
            event.source.postMessage(
                {
                    code: new URLSearchParams(window.location.search).get('code')
                },
                event.origin
            );
        });
    </script>
</body>
</html>
	`;
});
