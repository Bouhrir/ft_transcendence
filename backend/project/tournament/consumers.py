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
from remote.models import Game
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist


class TournamentConsumer(AsyncWebsocketConsumer):
	games = {
		"first_semis": [],
		"second_semis": [],
		"final": [],
		"winner": None,
		"status": "pending", #ongoing #finished
		"round": "semis" #final
	}
	players = {
		"channel_name": None,
		"room_name": None,
		"connected": False,
		"id": None,
		"alias": None,
		"status": "waiting", #ready #active(ongoing) #finished
		"result": None,
		"score": 0
	}

	async def is_already_in_tournament(self):
		rounds = ['final', 'first_semis', 'second_semis']
		for round_name in rounds:
			for player in self.games[round_name]:
				if player['id'] == self.player_id:
					player['channel_name'] = self.channel_name
					player['connected'] = True
					return

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
			await self.accept() # Accept the WebSocket connection
		else:
			await self.close() # Close connection if not authenticated
			return
		self.player_id = self.scope["user"].id  # Identify player
		await self.channel_layer.group_add(
			"global_room",
			self.channel_name
		)
		# global_room_user_count += 1
		await self.is_already_in_tournament()
		await self.send(text_data=json.dumps({
			"action": "new_connection",
			"player_id": self.player_id,
		}))
		await self.notify_game_status()
		
	async def disconnect(self, close_code):
		if hasattr(self, 'global_room'):
			await self.channel_layer.group_discard("global_room", self.channel_name)
		print("disconnect")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["type"] == "join":
			if len(self.games["first_semis"]) < 2 or len(self.games["second_semis"]) < 2:
				await self.match_games({
					"channel_name": self.channel_name,
					"connected": True,
					"id": data["player_id"],
					"alias": data["alias"],
					"status": "waiting",
					"result": None,
					"score": 0
				})
		if data["type"] == "play":
			print("change to active")
			if self.games["round"] == "semis":
				await self.change_action(data["player_id"], "active", ["first_semis", "second_semis"])
			else:
				await self.change_action(data["player_id"], "active", ["final"])
		if data["type"] == "reset":
			print("reseting tourney")
			await self.remove_from_group("first_semis")
			await self.remove_from_group("second_semis")
			await self.remove_from_group("final")
			TournamentConsumer.games = {
				"first_semis": [],
				"second_semis": [],
				"final": [],
				"winner": None,
				"status": "pending",
				"round": "semis"
			}
			# await self.notify_game_status()
			await self.channel_layer.group_send(
				"global_room",
				{
					"type": "reset",
					"games": self.games
				}
			)

	async def remove_from_group(self, round):
		round_group = self.games[round]
		for player in round_group:
			await self.channel_layer.group_discard(round, player["channel_name"])

	async def change_action(self, player_id, status, stages):
		# Iterate over the provided stages
		for game_stage in stages:
			players = self.games[game_stage]
			for player in players:
				if player["id"] == player_id:
					player["status"] = status
					return

	async def notify_game_status(self):
		# Send updated game status to all players
		await self.channel_layer.group_send(
			"global_room",
			{
				"type": "status",
				"games": self.games
			}
		)

	async def match_games(self, player):
		if len(self.games["first_semis"]) < 2:
			if player in self.games["first_semis"]:
				return
			self.games["first_semis"].append(player)
			await self.channel_layer.group_add("first_semis", self.channel_name)
			await self.notify_game_status()
		elif len(self.games["second_semis"]) < 2:
			if player in self.games["second_semis"]:
				return
			self.games["second_semis"].append(player)
			await self.channel_layer.group_add("second_semis", self.channel_name)
			await self.notify_game_status()
		if len(self.games["first_semis"]) == 2 and len(self.games["second_semis"]) == 2:
			self.games["status"] = "ongoing"
			await self.notify_game_status()
			await self.launch_semis()

	async def final_player(self, player):
		return {
			"channel_name": player["channel_name"],
			"id": player["id"],
			"alias": player["alias"],
			"status": "waiting",
			"result": None,
			"score": 0
		}

	async def determine_semis_winners(self, room_name1, room_name2):
		print("determine semis winner")
		semis1 = await database_sync_to_async(Game.objects.get)(room_name=room_name1)
		semis2 = await database_sync_to_async(Game.objects.get)(room_name=room_name2)
		semis1_winner = await database_sync_to_async(lambda: semis1.winner)()
		semis2_winner = await database_sync_to_async(lambda: semis2.winner)()
		if semis1_winner is not None:
			print("semis1_winner")
			if semis1_winner.id == self.games["first_semis"][0]["id"]:
				self.games["final"].append(await self.final_player(self.games["first_semis"][0]))
				self.games["first_semis"][0]["result"] = "winner"
				self.games["first_semis"][1]["result"] = "loser"
				await self.channel_layer.group_add("final", self.games["first_semis"][0]["channel_name"])
			else:
				self.games["final"].append(await self.final_player(self.games["first_semis"][1]))
				self.games["first_semis"][0]["result"] = "loser"
				self.games["first_semis"][1]["result"] = "winner"
				await self.channel_layer.group_add("final", self.games["first_semis"][1]["channel_name"])
			self.games["first_semis"][0]["score"] = await database_sync_to_async(semis1.get_player_score)(self.games["first_semis"][0]["id"])
			self.games["first_semis"][1]["score"] = await database_sync_to_async(semis1.get_player_score)(self.games["first_semis"][1]["id"])
			

		if semis2_winner is not None:
			print("semis2_winner")
			if semis2_winner.id == self.games["second_semis"][0]["id"]:
				self.games["final"].append(await self.final_player(self.games["second_semis"][0]))
				self.games["second_semis"][0]["result"] = "winner"
				self.games["second_semis"][1]["result"] = "loser"
				await self.channel_layer.group_add("final", self.games["second_semis"][0]["channel_name"])
			else:
				self.games["final"].append(await self.final_player(self.games["second_semis"][1]))
				self.games["second_semis"][0]["result"] = "loser"
				self.games["second_semis"][1]["result"] = "winner"
				await self.channel_layer.group_add("final", self.games["second_semis"][1]["channel_name"])
			self.games["second_semis"][0]["score"] = await database_sync_to_async(semis2.get_player_score)(self.games["second_semis"][0]["id"])
			self.games["second_semis"][1]["score"] = await database_sync_to_async(semis2.get_player_score)(self.games["second_semis"][1]["id"])
		
		await self.notify_game_status()

	async def check_semis_status(self, room_name1, room_name2):
		while True:
			try:
				semis1 = await database_sync_to_async(Game.objects.get)(room_name=room_name1)
				semis2 = await database_sync_to_async(Game.objects.get)(room_name=room_name2)

				# Check if both games have finished
				if (semis1.status == "finished" and semis2.status == "finished"):
					print("semis games finished")
					await self.determine_semis_winners(room_name1, room_name2)
					await self.launch_finals()
					return
			except ObjectDoesNotExist:
				print("Game not found. Waiting for game creation...")
			await asyncio.sleep(1)

	async def launch_semis(self):
		print("launching semis")
		room_name1 = f"room_{uuid.uuid4().hex}"
		room_name2 = f"room_{uuid.uuid4().hex}"

		semis1 = await database_sync_to_async(Game.objects.create)(
			host_id=self.games["first_semis"][0]["id"],
			guest_id=self.games["first_semis"][1]["id"],
			room_name=room_name1,
			type="tournament"
		)
		semis2 = await database_sync_to_async(Game.objects.create)(
			host_id=self.games["second_semis"][0]["id"],
			guest_id=self.games["second_semis"][1]["id"],
			room_name=room_name2,
			type="tournament"
		)
		self.games["first_semis"][0]["room_name"] = room_name1
		self.games["first_semis"][1]["room_name"] = room_name1
		self.games["second_semis"][0]["room_name"] = room_name2
		self.games["second_semis"][1]["room_name"] = room_name2
		await self.change_action(self.games["first_semis"][0]["id"], "ready", ["first_semis", "second_semis"])
		await self.change_action(self.games["first_semis"][1]["id"], "ready", ["first_semis", "second_semis"])
		await self.change_action(self.games["second_semis"][0]["id"], "ready", ["first_semis", "second_semis"])
		await self.change_action(self.games["second_semis"][1]["id"], "ready", ["first_semis", "second_semis"])
		await self.notify_game_status()
		task = asyncio.create_task(self.check_semis_status(room_name1, room_name2))

	async def set_only_winner(self):
		self.games["final"][0]["result"] = "winner"
		self.games["final"][0]["score"] = 3

	async def launch_finals(self):
		print("launching finals")
		room_name = f"room_{uuid.uuid4().hex}"
		final = await database_sync_to_async(Game.objects.create)(
			host_id=self.games["final"][0]["id"],
			guest_id=self.games["final"][1]["id"],
			room_name=room_name,
			type="tournament"
		)
		self.games["final"][0]["room_name"] = room_name
		self.games["final"][1]["room_name"] = room_name
		await self.change_action(self.games["final"][0]["id"], "ready", ["final"])
		await self.change_action(self.games["final"][1]["id"], "ready", ["final"])
		asyncio.create_task(self.check_final_status(room_name))

	async def determine_final_winner(self, room_name):
		print("determine final winner")
		final = await database_sync_to_async(Game.objects.get)(room_name=room_name)
		final_winner = await database_sync_to_async(lambda: final.winner)()
		print(final_winner)
		if final_winner is not None:
			print("final_winner")
			if final_winner.id == self.games["final"][0]["id"]:
				self.games["final"][0]["result"] = "winner"
				self.games["final"][1]["result"] = "loser"
				self.games["winner"] = self.games["final"][0]
			else:
				self.games["final"][1]["result"] = "winner"
				self.games["final"][0]["result"] = "loser"
				self.games["winner"] = self.games["final"][1]
			self.games["final"][0]["score"] = await database_sync_to_async(final.get_player_score)(self.games["final"][0]["id"])
			self.games["final"][1]["score"] = await database_sync_to_async(final.get_player_score)(self.games["final"][1]["id"])
		self.games["status"] = "finished"
		await self.notify_game_status()	

	async def check_final_status(self, room_name):
		print("check_final_status")
		while True:
			try:
				final = await database_sync_to_async(Game.objects.get)(room_name=room_name)
				if (final.status == "finished"):
					await self.determine_final_winner(room_name)
					return
			except ObjectDoesNotExist:
				print("Game not found. Waiting for game creation...")
			await asyncio.sleep(1)
	
	async def status(self, event):
		await self.send(text_data=json.dumps({
			"action": "status",
			"games": event["games"]
		}))

	async def reset(self, event):
		print("the end")
		await self.send(text_data=json.dumps({
			"action": "reset",
			"games": event["games"]
		}))