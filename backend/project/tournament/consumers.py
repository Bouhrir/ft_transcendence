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
from django.core.exceptions import ObjectDoesNotExist



class TournamentConsumer(AsyncWebsocketConsumer):
	games = {
		"first_semis": [],
		"second_semis": [],
		"final": [],
		"winner": None,
		"status": "pending",
		"round": "semis"
	}
	players = {
		"channel_name": None,
		"id": None,
		"alias": None,
		"status": "waiting",
		"result": None,
		"score": 0
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
		await self.channel_layer.group_add(
			"global_room",
			self.channel_name
		)
		#if player already in the games i should update it's channel_name
		await self.send(text_data=json.dumps({
			"action": "new_connection",
			"player_id": self.player_id,
			"games": self.games
		}))
		
	async def disconnect(self, close_code):
		# in disconnect you should check what you will be removing before deconnecting
		print("disconnect")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["type"] == "join":
			if len(self.games["first_semis"]) < 2 or len(self.games["second_semis"]) < 2:
				await self.match_games({
					"channel_name": self.channel_name,
					"id": data["player_id"],
					"alias": data["alias"],
					"status": "waiting",  # Default action
					"result": None,
					"score": 0
				})
			else:
				print("full room")
		if data["type"] == "play":
			print("change to active")
			await self.change_action(data["player_id"], "active", ["first_semis", "second_semis"])
		if data["type"] == "back":
			# print("change to finished")
			await self.send(text_data=json.dumps({
				"action": "new_connection",
				"player_id": self.player_id,
				"games": self.games
			}))
			print("back: ", self.player_id)
			await self.change_action(self.player_id, "finished", ["first_semis", "second_semis"])
			await self.is_semis_finished()
			# await self.is_semis_finished()
			# when they are back from the finals what should i do
			# when you move the winners into the finals bracket you should change it into waiting action

	async def is_semis_finished(self):
		if self.games["round"] != "semis":
			return
		first_semis = False
		second_semis = False
		if self.games["first_semis"][0]["status"] == "finished" and self.games["first_semis"][1]["status"] == "finished":
			first_semis = True
		if self.games["second_semis"][0]["status"] == "finished" and self.games["second_semis"][1]["status"] == "finished":
			second_semis = True
		# Check second_semis
		if first_semis == True and second_semis == True:
			# task = asyncio.create_task(self.launch_finals())
			self.games["round"] = "final"
			await self.launch_finals()

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
			# maybe let him if he wants to change the alias name
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
		
		#maybe here i should get the score and the winner and the loser so i can display it in the front, just do it inside the condition maybe 
		await self.notify_game_status()
		#send update to users globally maybe
	
	async def check_if_joined(self, round, room_name):
		if self.games[round][0]["status"] == "waiting" and self.games[round][1]["status"] == "waiting":
			print("match_timeout: both_didnt_join")
			await self.channel_layer.group_send(
				round,
				{
					"type": "cancelled",
				}
			)
			game = await database_sync_to_async(Game.objects.get)(room_name=room_name)
			game.status = "cancelled"
			await database_sync_to_async(game.save)()

	async def check_semis_status(self, room_name1, room_name2):
		start_time = asyncio.get_event_loop().time()
		check_timeout = False
		#maybe do a variable so you check the timeout once
		while True:
			elapsed_time = asyncio.get_event_loop().time() - start_time
			if elapsed_time >= 5 and check_timeout == False:
				check_timeout = True
				await self.check_if_joined("first_semis", room_name1)
				await self.check_if_joined("second_semis", room_name2)
				# check if at least one of them joined if both have not you should consider the game cancelled and you should send an update to remove the play button
			try:
				semis1 = await database_sync_to_async(Game.objects.get)(room_name=room_name1)
				semis2 = await database_sync_to_async(Game.objects.get)(room_name=room_name2)

				# Check if both games have finished
				if (semis1.status == "finished" or semis1.status == "cancelled") and (semis2.status == "finished" or semis2.status == "cancelled"):
					if semis1.status == "cancelled":
						await self.change_action(self.games["first_semis"][0]["id"], "finished", ["first_semis"])
						await self.change_action(self.games["first_semis"][1]["id"], "finished", ["first_semis"])
					if semis2.status == "cancelled":
						await self.change_action(self.games["second_semis"][0]["id"], "finished", ["second_semis"])
						await self.change_action(self.games["second_semis"][1]["id"], "finished", ["second_semis"])
					# here i should be knowing the winner from the remote module and i should send the update
					await self.determine_semis_winners(room_name1, room_name2)
					print("games finished")
					break
			except ObjectDoesNotExist:
				print("Game not found. Waiting for game creation...")
			await asyncio.sleep(0.5)
		# await self.launch_finals()

	async def launch_semis(self):
		print("launching semis")
		room_name1 = f"room_{uuid.uuid4().hex}"
		room_name2 = f"room_{uuid.uuid4().hex}"

		semis1 = await database_sync_to_async(Game.objects.create)(
			host_id=self.games["first_semis"][0]["id"],
			guest_id=self.games["first_semis"][1]["id"],
			room_name=room_name1
		)
		semis2 = await database_sync_to_async(Game.objects.create)(
			host_id=self.games["second_semis"][0]["id"],
			guest_id=self.games["second_semis"][1]["id"],
			room_name=room_name2
		)
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
		task = asyncio.create_task(self.check_semis_status(room_name1, room_name2))
		# await self.check_semis_status(room_name1, room_name2)
		# await task
	async def set_only_winner(self):
		self.games["final"][0]["result"] = "winner"
		self.games["final"][0]["score"] = 3

	async def launch_finals(self):
		print("launching finals")
		# await asyncio.sleep(10)
		if len(self.games["final"]) == 0:
			print("nobody won")
			await self.channel_layer.group_send(
				"global_room",
				{
					"type": "nobody_won",
				}
			)
			# nobody qualified so nobody won, so just reset that i think
			return
		elif len(self.games["final"]) == 1:
			print("one winner")
			await self.set_only_winner()
			await self.notify_game_status()
			# the winner is already set
			return
		room_name = f"room_{uuid.uuid4().hex}"
		final = await database_sync_to_async(Game.objects.create)(
			host_id=self.games["final"][0]["id"],
			guest_id=self.games["final"][1]["id"],
			room_name=room_name
		)
		await self.channel_layer.group_send(
			"final",
			{
				"type": "redirect_game",
				"room": room_name
			}
		)
		asyncio.create_task(self.check_final_status(room_name))
		# await self.check_final_status(room_name)

	async def determine_final_winner(self, room_name):
		print("determine final winner")
		final = await database_sync_to_async(Game.objects.get)(room_name=room_name)
		final_winner = await database_sync_to_async(lambda: final.winner)()
		if final_winner is not None:
			print("final_winner")
			self.games["final"][0]["score"] = await database_sync_to_async(final.get_player_score)(self.games["final"][0]["id"])
			self.games["final"][1]["score"] = await database_sync_to_async(final.get_player_score)(self.games["final"][1]["id"])
			if final_winner.id == self.games["final"][0]["id"]:
				self.games["final"][0]["result"] = "winner"
				self.games["final"][1]["result"] = "loser"
				# self.games["winner"] = self.games["final"][0]
			else:
				self.games["final"][1]["result"] = "winner"
				self.games["final"][0]["result"] = "loser"
				# self.games["winner"] = self.games["final"][1]

	async def check_final_status(self, room_name):
		print("check_final_status")
		start_time = asyncio.get_event_loop().time()
		check_timeout = False
		#maybe do a variable so you check the timeout once
		while True:
			elapsed_time = asyncio.get_event_loop().time() - start_time
			if elapsed_time >= 5 and check_timeout == False:
				check_timeout = True
				await self.check_if_joined("final", room_name)
				# check if at least one of them joined if both have not you should consider the game cancelled and you should send an update to remove the play button
			try:
				final = await database_sync_to_async(Game.objects.get)(room_name=room_name)
				# Check if both games have finished
				if (final.status == "finished" or final.status == "cancelled"):
					# here i should be knowing the winner from the remote module and i should send the update
					await self.determine_final_winner(room_name)
					await self.notify_game_status()
					print("games finished")
					return
			except ObjectDoesNotExist:
				print("Game not found. Waiting for game creation...")
			await asyncio.sleep(1)
	



	async def redirect_game(self, event):
		print("i am sending it")
		await self.send(text_data=json.dumps({
			"action": "redirect_game",
			"room": event["room"]
		}))
	async def status(self, event):
		await self.send(text_data=json.dumps({
			"action": "status",
			"games": event["games"]
		}))
	async def cancelled(self, event):
		await self.send(text_data=json.dumps({
			"action": "cancelled",
		}))
	async def nobody_won(self, event):
		await self.send(text_data=json.dumps({
			"action": "nobody_won",
		}))

def create_game(player1_id, player2_id, room_name):
	# Fetch the User objects for player1 and player2
	player1 = User.objects.get(id=player1_id)
	player2 = User.objects.get(id=player2_id)

	# Create the Game instance
	game = Game.objects.create(
		host=player1,  # Assign player1 as the host
		guest=player2,  # Assign player2 as the guest
		room_name=room_name,  # Set the room_name
		status='waiting',  # Initial status of the game
	)

	return game