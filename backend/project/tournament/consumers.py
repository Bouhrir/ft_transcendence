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
from django.contrib.auth.models import User



class TournamentConsumer(AsyncWebsocketConsumer):
	games = {
		"first_semis": [],
		"second_semis": [],
		"final": []
	}
	players = {
		"id": None,
		"alias": None
	}
	async def connect(self):
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
			await self.accept() # Accept the WebSocket connection
		else:
			await self.close() # Close connection if not authenticated
			return
		self.player_id = self.scope["user"].id  # Identify player
		print(self.scope['user'].username)
		await self.channel_layer.group_add(
            "global_room",
            self.channel_name
        )
		await self.send(text_data=json.dumps({
			"action": "new_connection",
			"player_id": self.player_id
		}))
		# await self.match_games()
		
	async def disconnect(self, close_code):
		print("disconnect")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["type"] == "join":
			if len(self.games["first_semis"]) < 2 or len(self.games["second_semis"]) < 2:
				await self.match_games({"id": self.player_id, "alias": data["alias"]})
				# print(f"Total players: {len(self.players)}")
			else:
				print("full room")
				# await self.send(text_data=json.dumps({
				# 	"action": "redirect_game",
				# 	"room": event["room"]
				# }))


	async def match_games(self, player):
		if len(self.games["first_semis"]) < 2:
			# maybe let him if he wants to change the alias name
			if player in self.games["first_semis"]:
				print("already in tourn")
				return
			print(f"adding{self.player_id}")
			self.games["first_semis"].append(player)
			await self.channel_layer.group_add("first_semis", self.channel_name)
		elif len(self.games["second_semis"]) < 2:
			if player in self.games["second_semis"]:
				print("already in tourn")
				return
			await self.channel_layer.group_add("second_semis", self.channel_name)
			print(f"adding{self.player_id}")
			self.games["second_semis"].append(player)
		if len(self.games["first_semis"]) == 2 and len(self.games["second_semis"]) == 2:
			print("launch games")
			await self.launch_semis()


	async def launch_semis(self):
		print("launch tournament")
		# game1 = self.players[2:]
		# game2 = self.players[:2]

		print("launching semis")
		room_name1 = f"room_{uuid.uuid4().hex}"
		room_name2 = f"room_{uuid.uuid4().hex}"

		await self.channel_layer.group_send(
			"first_semis",
			{
				"type": "redirect_game",
				"room": room_name1
			}
		)
		await self.channel_layer.group_send(
			"second_semis",
			{
				"type": "redirect_game",
				"room": room_name2
			}
		)
		# semis_game1.clear

	async def redirect_game(self, event):
		await self.send(text_data=json.dumps({
			"action": "redirect_game",
			"room": event["room"]
		}))