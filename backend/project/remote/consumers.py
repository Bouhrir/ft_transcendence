import json
import asyncio
import random
import time
import struct
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError
from jwt import decode, ExpiredSignatureError, DecodeError
from channels.db import database_sync_to_async
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
from remote.models import Game
from django.contrib.auth.models import AnonymousUser
from chat.models import Invitation


class PongConsumer(AsyncWebsocketConsumer):
	game_states = {}
	# dimensions = {}
	async def initialize_game_state(self, room_name, type):
		if room_name not in self.game_states:
			self.game_states[room_name] = {
				#set the type if tournament or game
				"type": type,
				"ball": {
					'x': self.canvas_width / 2,
					'y': self.canvas_height / 2,
					'dx': 3 * (1 if random.random() > 0.5 else -1),
					'dy': 3 * (1 if random.random() > 0.5 else -1),
				},
				"players": {
					"player1": {
						"id": None,
						"channel_name": None,
						"connected": False,
						"player_y": self.canvas_height / 2 - self.paddle_height / 2,
						"player_dy": 0,
						"player_x": 0,
						"ai_x": self.canvas_width - self.paddle_width,
						"ai_y": self.canvas_height / 2 - self.paddle_height / 2,
						"ai_dy": 0,
						"player_score": 0,
						"ai_score": 0,
					},
					"player2": {
						"id": None,
						"channel_name": None,
						"connected": False,
						"player_y": self.canvas_height / 2 - self.paddle_height / 2,
						"player_dy": 0,
						"ai_y": self.canvas_height / 2 - self.paddle_height / 2,
						"ai_dy": 0,
					}
				},
			}
	async def check_paddle_boundaries(self, player):
		if (player["player_y"] < 0):
			player["player_y"] = 0
		if (player["player_y"] + self.paddle_height > self.canvas_height):
			player["player_y"] = self.canvas_height - self.paddle_height
		if (player["ai_y"] < 0):
			player["ai_y"] = 0
		if (player["ai_y"] + + self.paddle_height > self.canvas_height):
			player["ai_y"] = self.canvas_height - self.paddle_height
		return player

	async def check_ball_collisions(self, ball, player):
		# ball top bottom collisions
		if (ball['y'] + self.ball_radius > self.canvas_height or ball['y'] - self.ball_radius < 0):
			ball['dy'] *= -1
		# ball collision with paddles
		if (ball['x'] - self.ball_radius < player["player_x"] + self.paddle_width and ball['y'] > player["player_y"] and ball['y'] < player["player_y"] + self.paddle_height):
			ball['dx'] *= -1
		if (ball['x'] + self.ball_radius > player["ai_x"] and ball['y'] > player["ai_y"] and ball['y'] < player["ai_y"] + self.paddle_height):
			ball['dx'] *= -1
		# Ball goes off the screen
		if (ball['x'] - self.ball_radius < 0):
			player["ai_score"] += 1
			#ai
			return await self.reset_ball()
		elif (ball['x'] + self.ball_radius > self.canvas_width):
			player["player_score"] += 1
			#player
			return await self.reset_ball()
		return ball

	async def reset_ball(self):
		return {
				'x': self.canvas_width / 2,
				'y': self.canvas_height / 2,
				'dx': 3 * (1 if random.random() > 0.5 else -1),
				'dy': 3 * (1 if random.random() > 0.5 else -1),
		}

	async def setPlayers(self, room_name):
		if self.game_states[room_name]["players"]["player1"]["id"] is None:
			self.game_states[room_name]["players"]["player1"]["id"] = self.player_id
			self.game_states[room_name]["players"]["player1"]["channel_name"] = self.channel_name
			self.game_states[room_name]["players"]["player1"]["connected"] = True
		elif self.game_states[room_name]["players"]["player2"]["id"] is None:
			self.game_states[room_name]["players"]["player2"]["id"] = self.player_id
			self.game_states[room_name]["players"]["player2"]["channel_name"] = self.channel_name
			self.game_states[room_name]["players"]["player2"]["connected"] = True
		else:
			print("room is full")

	async def connect(self):
		self.ball_radius = 10
		self.canvas_height = 640
		self.canvas_width = 1525
		self.paddle_height = 120
		self.paddle_width = 14
		cookie_value = self.scope['cookies'].get('access')
		# print(cookie_value)
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
			await self.close()  # Close connection if not authenticated
			return
		self.player_id = self.scope["user"].id
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f"pong_{self.room_name}"
		try:
			# Check if the game exists in the database
			game = await database_sync_to_async(Game.objects.get)(room_name=self.room_name)
			## i should check this again, i don't think i should check if it's cancelled, because i won't cancel it##
			if game.status == "cancelled":
				print("game is cancelled")
				await self.notify_and_close('no_room')
				return
		except Game.DoesNotExist:
			# If the game doesn't exist, inform the player and close the connection
			await self.notify_and_close('no_room')
			return
		if self.room_name not in self.game_states:
			await self.initialize_game_state(self.room_name, game.type)
		await self.setPlayers(self.room_name)
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		await self.send(text_data=json.dumps({
			'action': 'new_connection',
			'player_id': self.scope['user'].id
		}))
		if self.game_states[self.room_name]["players"]["player1"]["id"] is not None and self.game_states[self.room_name]["players"]["player2"]["id"] is not None:
			self.game_started = True
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'start',
					'action': 'start',
					'player1_id': self.game_states[self.room_name]["players"]["player1"]["id"],
					'player2_id': self.game_states[self.room_name]["players"]["player2"]["id"]
				}
			)
			asyncio.create_task(self.game_loop())
			return

	async def notify_and_close(self, action):
		await self.send(text_data=json.dumps({
			'action': action,
			'player_id': self.scope['user'].id
		}))
		await self.close()

	async def disconnect(self, close_code):
		# i should set the game to finished if the connection is disconnected
		# room_group_name is not set when you close on the not authenticated user
		if self.game_states[self.room_name]["players"]["player2"]["id"] is None and self.game_states[self.room_name]["type"] == "game":
			await self.remove_invitation_game()
		if self.player_id == self.game_states[self.room_name]["players"]["player1"]["id"]:
			self.game_states[self.room_name]["players"]["player1"]["connected"] = False
		elif self.player_id == self.game_states[self.room_name]["players"]["player2"]["id"]:
			self.game_states[self.room_name]["players"]["player2"]["connected"] = False
		if hasattr(self, 'room_group_name'):	
			print("removing from group")
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		print(f"disconnect: {self.player_id}")

# i am either gonna check before giving the other value or just give both the value then check after i will test and then decide
	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["type"] == "paddle_movement":
			print(f"receiving data from{data['player_id']}")
			room_name = data["room_name"]
			if data["player_id"] == self.game_states[room_name]["players"]["player1"]["id"]:
				# self.game_states[room_name]["players"]["player1"]["player_dy"] = data["paddle_dy"]
				self.game_states[room_name]["players"]["player1"]["player_dy"] = data["paddle_dy"]
				self.game_states[room_name]["players"]["player2"]["ai_dy"] = data["paddle_dy"]
			else:
				# self.game_states[room_name]["players"]["player1"]["ai_dy"] = data["paddle_dy"]
				self.game_states[room_name]["players"]["player2"]["player_dy"] = data["paddle_dy"]
				self.game_states[room_name]["players"]["player1"]["ai_dy"] = data["paddle_dy"]
		if data["type"] == "leave":
			await self.close()
			print("leaving the game")

	async def remove_invitation_game(self):
		print("remove invitation")
		# game = await database_sync_to_async(Game.objects.get)(room_name=self.room_name)
		invitation = await database_sync_to_async(Invitation.objects.get)(room_name=self.room_name)
		invitation.status = "cancelled"
		await database_sync_to_async(invitation.save)()

	async def game_loop(self):
		await asyncio.sleep(2)
		while True:
			if not self.game_states[self.room_name]["players"]["player1"]["connected"]:
				print(f'not in room: {self.game_states[self.room_name]["players"]["player1"]["id"]}')
				self.game_states[self.room_name]["players"]["player1"]["player_score"] = 0
				self.game_states[self.room_name]["players"]["player1"]["ai_score"] = 3
				break
			elif not self.game_states[self.room_name]["players"]["player2"]["connected"]:
				print(f'not in room: {self.game_states[self.room_name]["players"]["player2"]["id"]}')
				self.game_states[self.room_name]["players"]["player1"]["player_score"] = 3
				self.game_states[self.room_name]["players"]["player1"]["ai_score"] = 0
				break
			# Update ball position
			self.game_states[self.room_name]['ball']['x'] += self.game_states[self.room_name]['ball']['dx']
			self.game_states[self.room_name]['ball']['y'] += self.game_states[self.room_name]['ball']['dy']
			self.game_states[self.room_name]["players"]["player1"]["player_y"] += self.game_states[self.room_name]["players"]["player1"]["player_dy"]
			self.game_states[self.room_name]["players"]["player1"]["ai_y"] += self.game_states[self.room_name]["players"]["player1"]["ai_dy"]
			self.game_states[self.room_name]["players"]["player2"]["player_y"] += self.game_states[self.room_name]["players"]["player2"]["player_dy"]
			self.game_states[self.room_name]["players"]["player2"]["ai_y"] += self.game_states[self.room_name]["players"]["player2"]["ai_dy"]
			self.game_states[self.room_name]['ball'] = await self.check_ball_collisions(self.game_states[self.room_name]['ball'], self.game_states[self.room_name]['players']["player1"])
			#Ensure paddle stays within canvas bounds
			self.game_states[self.room_name]["players"]["player1"] = await self.check_paddle_boundaries(self.game_states[self.room_name]["players"]["player1"])
			self.game_states[self.room_name]["players"]["player2"] = await self.check_paddle_boundaries(self.game_states[self.room_name]["players"]["player2"])
			if self.game_states[self.room_name]["players"]["player1"]["player_score"] == 5 or self.game_states[self.room_name]["players"]["player1"]["ai_score"] == 5:
				break
			# await asyncio.gather()
			await self.send_game_state_to_players(self.game_states[self.room_name])
			await asyncio.sleep(1/60)
		game = await database_sync_to_async(Game.objects.get)(room_name=self.room_name)
		await database_sync_to_async(game.set_score)(self.game_states[self.room_name]["players"]["player1"]["id"], self.game_states[self.room_name]["players"]["player1"]["player_score"], self.game_states[self.room_name]["players"]["player1"]["ai_score"])
		await database_sync_to_async(game.determine_winner)()
		# await database_sync_to_async(game.save)()
		# wini = await database_sync_to_async(lambda: game.winner)()
		# print(f"winner: {wini}")
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'state',
				'action': 'end'
			}
		)
		
			

	async def send_game_state_to_players(self, game_state):
		await self.channel_layer.send(
			game_state['players']['player1']['channel_name'],
			{
				'type': 'game',
				'game_state': game_state  # Send original ball position
			}
		)
		mirrored_ball = game_state['ball'].copy()
		mirrored_ball['x'] = self.canvas_width - game_state['ball']['x']
		game_state_player2 = game_state.copy()
		game_state_player2['ball'] = mirrored_ball
		# game_state_player2["players"]["player2"]["player_y"] = game_state["players"]["player1"]["ai_y"]
		# game_state_player2["players"]["player2"]["ai_y"] = game_state["players"]["player1"]["player_y"]
		await self.channel_layer.send(
			game_state['players']['player2']['channel_name'],
			{
				'type': 'game',
				'game_state': game_state_player2  # Send mirrored ball position
			}
		)

			

	async def game(self, event):
		await self.send(text_data=json.dumps({
			'action': "game_state",
			# 'player_id': event['player_id'],
			'game_state': event['game_state']
		}))

	async def state(self, event):
		await self.send(text_data=json.dumps({
			'action': event['action'],
		}))
	
	async def start(self, event):
		await self.send(text_data=json.dumps({
			'action': event['action'],
			'player1_id': event['player1_id'],
			'player2_id': event['player2_id'],
		}))