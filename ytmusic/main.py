import json
import os
import random
import aiohttp
import re
import urllib.parse
import time
import motor.motor_asyncio
from aiohttp import web
from ytmusicapi import YTMusic

config = json.load(open('config.json'))

ytmusic = YTMusic()
db = motor.motor_asyncio.AsyncIOMotorClient().stopify

app = web.Application()
route = web.RouteTableDef()

spotify_auth = {}

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

def format_lyrics(lyrics):
	for line_no in range(0, len(lyrics) - 1):
		line = lyrics[line_no]
		line["startTimeMs"] = int(line["startTimeMs"])
		line["endTimeMs"] = lyrics[line_no + 1]["startTimeMs"]

	lyrics[-1]["startTimeMs"] = int(lyrics[-1]["startTimeMs"])
	lyrics[-1]["endTimeMs"] = lyrics[-1]["startTimeMs"] + 9999999

	return lyrics

async def set_spotify_auth():
	async with aiohttp.ClientSession() as session:
		async with session.get('https://open.spotify.com/', headers = {
			"Cookie": config['spotify-cookies'],
		}) as res:
			text = await res.text()
			
			spotify_auth["device_id"] = re.search(r'"correlationId":"(.*?)"', text).group(1)
			spotify_auth["accesstoken"] = re.search(r'"accessToken":"(.*?)"', text).group(1)
			spotify_auth["accesstokenExpiry"] = int(re.search(r'"accessTokenExpirationTimestampMs":(.*?),', text).group(1)) / 1000

		async with session.post(
			'https://clienttoken.spotify.com/v1/clienttoken', 
			json = {
				"client_data": {
					"client_version": "1.2.17.670.g37f0a40f",
					"client_id": "d8a5ed958d274c2e8ee717e6a4b0971d",
					"js_sdk_data": {
						"device_brand": "unknown",
						"device_model": "unknown",
						"os": "windows",
						"os_version": "NT 10.0",
						"device_id": spotify_auth["device_id"],
						"device_type": "computer"
					}
				}
			},
			headers = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			}
		) as res:
			data = await res.json()
			spotify_auth['clienttoken'] = data['granted_token']['token']
			spotify_auth['clienttokenExpiry'] = data['granted_token']['refresh_after_seconds'] + time.time()

	return spotify_auth

@route.get('/lyrics')
async def lyrics(request: web.Request):
	if os.getenv("PY_ENV") != "development":
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
		_id = results[0]['videoId']
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
	if os.getenv("PY_ENV") != "development":
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
	if os.getenv("PY_ENV") != "development":
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

@route.get('/spotify-lyrics')
async def spotify_lyrics(request: web.Request):
	if os.getenv("PY_ENV") != "development":
		auth = request.headers.get('Authorization')
		if not auth:
			return web.Response(status=401, text='Missing Authorization header')
		elif auth != config.get('YTMUSIC_SECRET'):
			return web.Response(status=403, text='Invalid Authorization header')

	if not request.query.get('q'):
		return web.Response(status=400, text='Missing query parameter: q')

	if not all([
		spotify_auth.get('accesstoken'), 
		spotify_auth.get('clienttoken'), 
		spotify_auth.get('accesstokenExpiry', 0) > time.time(),
		spotify_auth.get('clienttokenExpiry', 0) > time.time()
	]):
		print("Refreshing Spotify auth")
		await set_spotify_auth()

	async with aiohttp.ClientSession() as session:
		search_res = await (await session.get("https://api.spotify.com/v1/search?type=track&q=" + request.query.get('q'), headers = {
			"Authorization": "Bearer " + spotify_auth['accesstoken'],
			"Accept": "application/json",
		})).json()

		track = search_res['tracks']['items'][0]

		check = await db.spotify_lyrics.find_one({"id": track['id']})
		if check:
			return web.Response(status=200, text = json.dumps(check['lyrics']), headers = {
				"Content-Type": "application/json"
			})

		lyrics_url = f"https://spclient.wg.spotify.com/color-lyrics/v2/track/{track['id']}/image/{urllib.parse.quote_plus(track['album']['images'][0]['url'])}?format=json&vocalRemoval=false&market=from_token"
		lyrics_res = await session.get(lyrics_url, headers = {
			"Authorization": "Bearer " + str(spotify_auth['accesstoken']),
			"Client-Token": str(spotify_auth['clienttoken']),
			"Accept": "application/json",
			"App-Platform": "WebPlayer"
		})

		lyrics = await lyrics_res.json()
		fmtLyrics = format_lyrics(lyrics['lyrics']['lines'])
		await db.spotify_lyrics.insert_one({"id": track['id'], "lyrics": fmtLyrics})


		return web.Response(status=200, text = json.dumps(fmtLyrics), headers = {
			"Content-Type": "application/json"
		})

app.add_routes(route)
web.run_app(app, port = 8080 if os.getenv("PY_ENV") == "development" else 25690)