import json
import os
import random

import motor.motor_asyncio
from aiohttp import web
from ytmusicapi import YTMusic

config = json.load(open('config.json'))

ytmusic = YTMusic()
db = motor.motor_asyncio.AsyncIOMotorClient().stopify

app = web.Application()
route = web.RouteTableDef()

def format_result(song):
	return {
		"title": song['title'],
		"artist": song['artists'][0]['name'],
		"thumbnail": song['thumbnails'][0]['url'],
		"url": "https://youtube.com/watch?v=" + song['videoId'],
		"duration": song['duration'],
		"views": 0,
		"id": song['videoId'],
		"category": song['category'],
		"type": song['resultType']
	}

@route.get('/lyrics')
async def lyrics(request: web.Request):
	auth = request.headers.get('Authorization')
	if not auth:
		return web.Response(status=401, text='Missing Authorization header')
	elif auth != config.get('YTMUSIC_SECRET'):
		return web.Response(status=403, text='Invalid Authorization header')

	if not any([request.query.get('q'), request.query.get('id')]):
		return web.Response(status=400, text='Missing query parameter: q or id')
	elif all([request.query.get('q'), request.query.get('id')]):
		return web.Response(status=400, text='Only one of q and id can be specified')

	if request.query.get('q'):
		results = ytmusic.search(request.query.get('q'), filter="songs")
		if len(results) == 0:
			return web.Response(status=404, text='No results found')
		_id = results[0]['vid_ideoId']
	elif request.query.get('id'):
		_id = request.query.get('id')

	db_check = await db.lyrics.find_one({"videoId": _id})
	if db_check:
		return web.Response(status=200, text=db_check['lyrics'].replace('\n', '<br>'))

	watch_data = ytmusic.get_watch_playlist(_id)
	if not watch_data['lyrics']:
		return web.Response(status=404, text='No lyrics found')

	lyrics = ytmusic.get_lyrics(watch_data['lyrics'])
	await db.lyrics.insert_one({"videoId": _id, "lyrics": lyrics["lyrics"]})

	return web.Response(status=200, text=lyrics["lyrics"].replace('\n', '<br>'))

@route.get('/search')
async def search(request: web.Request):
	auth = request.headers.get('Authorization')
	if not auth:
		return web.Response(status=401, text='Missing Authorization header')
	elif auth != config.get('YTMUSIC_SECRET'):
		return web.Response(status=403, text='Invalid Authorization header')

	query = request.query.get('q')
	if not query:
		return web.Response(status=400, text='Missing query parameter: q')

	results = ytmusic.search(query)
	if len(results) == 0:
		return web.Response(status=404, text='No results found')

	ret = list(map(format_result, filter(lambda x: x['resultType'] in ['song', 'video'] and len(x['artists']) > 0 and x.get("duration"), results)))

	return web.Response(status=200, text=json.dumps(ret), content_type='application/json')

@route.get('/suggestion')
async def suggestion(request: web.Request):
	auth = request.headers.get('Authorization')
	if not auth:
		return web.Response(status=401, text='Missing Authorization header')
	elif auth != config.get('YTMUSIC_SECRET'):
		return web.Response(status=403, text='Invalid Authorization header')

	query = request.query.get('id')
	if not query:
		return web.Response(status=400, text='Missing query parameter: id')

	result = random.choice(list(filter(lambda x: x['videoId'] != query, ytmusic.get_watch_playlist(query)['tracks']))[:5])

	return web.Response(status=200, text=json.dumps({
		"title": result['title'],
		"artist": result['artists'][0]['name'],
		"thumbnail": result['thumbnail'][0]['url'],
		"url": "https://youtube.com/watch?v=" + result['videoId'],
		"duration": result['length'],
		"views": 0,
		"id": result['videoId'],

	}), content_type='application/json')

app.add_routes(route)
web.run_app(app, port = 8080 if os.getenv("PY_ENV") == "development" else 25690)