<template>
	<div class="lyrics-area">
		<div class="lyrics" v-html="$attrs.lyrics ?? 'No lyrics found.'"></div>
	</div>
</template>

<style>
.lyrics-area {
	display: flex;
	width: calc(100% - 400px);
	height: calc(100% - 105px);
	flex-direction: column;
	position: fixed;
	top: 0;
	left: 400px;
	overflow-y: auto;
}

.lyrics {
	text-align: center;
	font-size: 30px;
	line-height: 55px;
	font-family: Arial, Helvetica, sans-serif;
	margin: 50px auto;
}
</style>
