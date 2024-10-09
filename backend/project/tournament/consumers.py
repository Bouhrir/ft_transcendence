import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import random
import time
import struct
import uuid
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError
from jwt import decode, ExpiredSignatureError, DecodeError
from channels.db import database_sync_to_async
from channels.auth import AuthMiddlewareStack


class TournamentConsumer(AsyncWebsocketConsumer):
	semis_game1 = []
	semis_game2 = []
	async def connect(self):
		from django.contrib.auth.models import User
		cookie_value = self.scope['cookies'].get('access')
		if cookie_value:
			try:
				payload = decode(cookie_value, settings.SECRET_KEY, algorithms=["HS256"])
				user_id = payload.get('user_id')
				self.scope['user'] = await database_sync_to_async(User.objects.get)(id=user_id)
			except (ExpiredSignatureError, DecodeError, User.DoesNotExist, TokenError):
				self.scope['user'] = AnonymousUser()
		else:
			self.scope['user'] = AnonymousUser()

		if self.scope['user'].is_authenticated:
			# print(self.scope['user'])
			await self.accept()# Accept the WebSocket connection
		else:
			await self.close()# Close connection if not authenticated
			return
		self.player_id = self.scope["user"].id  # Identify player
		await self.match_games()
		
	async def disconnect(self, close_code):
		print("disconnect")

	async def receive(self, text_data):
		data = json.loads(text_data)
		print(data)

	async def match_games(self):
		print("match games")
		if len(self.semis_game1) < 2:
			print(f"adding{self.player_id}")
			self.semis_game1.append(self.player_id)
			await self.channel_layer.group_add("semis_game1", self.channel_name)
		elif len(self.semis_game2) < 2:
			print(f"adding{self.player_id}")
			self.semis_game2.append(self.player_id)
			await self.channel_layer.group_add("semis_game2", self.channel_name)
		if len(self.semis_game1) == 2:# and len(self.semis_game2) == 2:
			await self.launch_semis()


	async def launch_semis(self):
		print("launch tournament")
		# game1 = self.players[2:]
		# game2 = self.players[:2]

		print("launching semis")
		room_name1 = f"room_{uuid.uuid4().hex}"
		room_name2 = f"room_{uuid.uuid4().hex}"

		await self.channel_layer.group_send(
			"semis_game1",
			{
				"type": "redirect_game",
				"room": room_name1
			}
		)
		await self.channel_layer.group_send(
			"semis_game2",
			{
				"type": "redirect_game",
				"room": room_name2
			}
		)
		# semis_game1.clear

	async def redirect_game(self, event):
		print("test")
		await self.send(text_data=json.dumps({
			"action": "redirect_game",
			"room": event["room"]
		}))