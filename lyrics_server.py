from ytmusicapi import YTMusic
from aiohttp import web
import json
import motor.motor_asyncio

config = json.load(open('config.json'))

ytmusic = YTMusic()
db = motor.motor_asyncio.AsyncIOMotorClient().stopify

async def handle(request: web.Request):

	auth = request.headers.get('Authorization')
	if not auth:
		return web.Response(status=401, text='Missing Authorization header')
	elif auth != config.get('LYRICS_SECRET'):
		return web.Response(status=403, text='Invalid Authorization header')

	query = request.query.get('q')
	if not query:
		return web.Response(status=400, text='Missing query parameter: q')

	print("Lyrics requested for: " + query)
	
	results = ytmusic.search(query, filter="songs")
	if len(results) == 0:
		return web.Response(status=404, text='No results found')
	
	db_check = await db.lyrics.find_one({"videoId": results[0]['videoId']})
	if db_check:
		return web.Response(status=200, text=db_check['lyrics'].replace('\n', '<br>'))

	watch_data = ytmusic.get_watch_playlist(results[0]['videoId'])
	if not watch_data['lyrics']:
		return web.Response(status=404, text='No lyrics found')

	lyrics = ytmusic.get_lyrics(watch_data['lyrics'])
	await db.lyrics.insert_one({"videoId": results[0]['videoId'], "lyrics": lyrics["lyrics"]})

	return web.Response(status=200, text=lyrics["lyrics"].replace('\n', '<br>'))

app = web.Application()
app.add_routes([web.get('/', handle), web.get('/lyrics', handle)])

web.run_app(app, port = 25690)