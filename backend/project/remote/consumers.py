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


class PongConsumer(AsyncWebsocketConsumer):
	game_states = {}
	# dimensions = {}
	async def initialize_game_state(self, room_name):
		if room_name not in self.game_states:
			self.game_states[room_name] = {
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
						"player_y": 250,
						"player_dy": 0,
						"player_x": 0,
						"ai_x": self.canvas_width - self.paddle_width,
						"ai_y": 250,
						"ai_dy": 0,
						"player_score": 0,
						"ai_score": 0,
					},
					"player2": {
						"id": None,
						"channel_name": None,
						"player_y": 250,
						"player_dy": 0,
						"ai_y": 250,
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

	# async def check_top_bottom_wall_collision(ball):
	#     if (ball['y'] + self.ball_radius > self.canvas_height or ball['y'] - self.ball_radius < 0):
	#         ball['dy'] *= -1
	#     return ball

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
			print(f"setting player1 with {self.player_id}")
			self.game_states[room_name]["players"]["player1"]["id"] = self.player_id
			self.game_states[room_name]["players"]["player1"]["channel_name"] = self.channel_name
		elif self.game_states[room_name]["players"]["player2"]["id"] is None:
			print(f"setting player2 with {self.player_id}")
			self.game_states[room_name]["players"]["player2"]["id"] = self.player_id
			self.game_states[room_name]["players"]["player2"]["channel_name"] = self.channel_name
		else:
			print("room is full")
		
	async def player_already_exist(self):
		if self.player_id == self.game_states[self.room_name]["players"]["player1"]["id"]:
			self.game_states[self.room_name]["players"]["player1"]["channel_name"] = self.channel_name
			return True
		elif self.player_id == self.game_states[self.room_name]["players"]["player2"]["id"]:
			self.game_states[self.room_name]["players"]["player1"]["channel_name"] = self.channel_name
			return True
		return False

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
		print(f"room_name: {self.room_name}")
		try:
			# Check if the game exists in the database
			game = await database_sync_to_async(Game.objects.get)(room_name=self.room_name)
			if game.status == "cancelled":
				print("game is cancelled")
				await self.notify_and_close('no_room')
				return
		except Game.DoesNotExist:
			print("game doesn't exist")
			# If the game doesn't exist, inform the player and close the connection
			await self.notify_and_close('no_room')
			return
		if self.room_name not in self.game_states:
			await self.initialize_game_state(self.room_name)
		await self.send(text_data=json.dumps({
			'action': 'new_connection',
			'player_id': self.scope['user'].id
		}))
		# if await self.player_already_exist():
		# 	# update his channel_name and the group_join
		# 	await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		# 	print("player already exist")
		# 	return
		await self.setPlayers(self.room_name)
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		if self.game_states[self.room_name]["players"]["player1"]["id"] is not None and self.game_states[self.room_name]["players"]["player2"]["id"] is not None:
			self.game_started = True
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'state',
					'action': 'start'
				}
			)
			asyncio.create_task(self.game_loop())
			return
		# asyncio.create_task(self.wait_for_opponent())
		# await self.wait_for_opponent()

	async def notify_and_close(self, action):
		await self.send(text_data=json.dumps({
			'action': action,
			'player_id': self.scope['user'].id
		}))
		await self.close()
	
	async def wait_for_opponent(self):
		start_time = asyncio.get_event_loop().time()
		while True:
			print("waiting")
			elapsed_time = asyncio.get_event_loop().time() - start_time
			if self.game_states[self.room_name]["players"]["player2"]["id"] is not None:
				print("game started")
				return
			if elapsed_time >= 5:
				print("endgame")
				try:
					game = await database_sync_to_async(Game.objects.get)(room_name=self.room_name)
					game.status = "cancelled"
					player1_id = self.game_states[self.room_name]["players"]["player1"]["id"]
					host_id = await database_sync_to_async(lambda: game.host.id)()
					guest_id = await database_sync_to_async(lambda: game.guest.id)()
					if player1_id == host_id:
						game.winner = game.host
						game.host
					elif player1_id == guest_id:
						game.winner = game.guest
					await database_sync_to_async(game.set_score)(self.player_id, 3, 0)
					await database_sync_to_async(game.save)()
				except ObjectDoesNotExist:
					print(f"Game with room name {self.room_name} does not exist.")
				await self.channel_layer.send(
					self.game_states[self.room_name]['players']['player1']['channel_name'],
					{
						'type': 'state',
						'action': 'end'
					}
				)
				return
			await asyncio.sleep(0.5)
			
		# wait for opponent, if game starts stop waiting, if not

	async def disconnect(self, close_code):
		# room_group_name is not set when you close on the not authenticated user
		if hasattr(self, 'room_group_name'):
			print("remove player from group")
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		print("disconnect")

# i am either gonna check before giving the other value or just give both the value then check after i will test and then decide
	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["type"] == "paddle_movement":
			room_name = data["room_name"]
			if data["player_id"] == self.game_states[room_name]["players"]["player1"]["id"]:
				self.game_states[room_name]["players"]["player1"]["player_dy"] = data["paddle_dy"]
				self.game_states[room_name]["players"]["player2"]["ai_dy"] = data["paddle_dy"]
			else:
				self.game_states[room_name]["players"]["player2"]["player_dy"] = data["paddle_dy"]
				self.game_states[room_name]["players"]["player1"]["ai_dy"] = data["paddle_dy"]



	async def game_loop(self):
		await asyncio.sleep(2)
		while True:
		# Update ball position
			self.game_states[self.room_name]['ball']['x'] += self.game_states[self.room_name]['ball']['dx']
			self.game_states[self.room_name]['ball']['y'] += self.game_states[self.room_name]['ball']['dy']
			self.game_states[self.room_name]["players"]["player1"]["player_y"] += self.game_states[self.room_name]["players"]["player1"]["player_dy"]
			self.game_states[self.room_name]["players"]["player1"]["ai_y"] += self.game_states[self.room_name]["players"]["player1"]["ai_dy"]
			self.game_states[self.room_name]["players"]["player2"]["player_y"] += self.game_states[self.room_name]["players"]["player2"]["player_dy"]
			self.game_states[self.room_name]["players"]["player2"]["ai_y"] += self.game_states[self.room_name]["players"]["player2"]["ai_dy"]
			# self.game_states[self.room_name]['ball'] = check_top_bottom_wall_collision(self.game_states[self.room_name]['ball'])
			self.game_states[self.room_name]['ball'] = await self.check_ball_collisions(self.game_states[self.room_name]['ball'], self.game_states[self.room_name]['players']["player1"])
			#Ensure paddle stays within canvas bounds
			self.game_states[self.room_name]["players"]["player1"] = await self.check_paddle_boundaries(self.game_states[self.room_name]["players"]["player1"])
			self.game_states[self.room_name]["players"]["player2"] = await self.check_paddle_boundaries(self.game_states[self.room_name]["players"]["player2"])
			if self.game_states[self.room_name]["players"]["player1"]["player_score"] == 5 or self.game_states[self.room_name]["players"]["player1"]["ai_score"] == 5:
				break
			# await asyncio.gather()
			await self.send_game_state_to_players(self.game_states[self.room_name])
			await asyncio.sleep(1/60)

		print(f"remote room_name: {self.room_name}")
		game = await database_sync_to_async(Game.objects.get)(room_name=self.room_name)
		# await database_sync_to_async(game.score_game(self.game_states[self.room_name]["players"]["player1"]["id"], self.game_states[self.room_name]["players"]["player1"]["player_score"], self.game_states[self.room_name]["players"]["player1"]["player_score"]))()
		await database_sync_to_async(game.set_score)(self.game_states[self.room_name]["players"]["player1"]["id"], self.game_states[self.room_name]["players"]["player1"]["player_score"], self.game_states[self.room_name]["players"]["player1"]["ai_score"])
		# await database_sync_to_async(game.set_host_score)(3)
		await database_sync_to_async(game.determine_winner)()
		# tobe removed
		# game_winner = await database_sync_to_async(lambda: game.winner)()
		# print("remote winner: ", game_winner)
		await database_sync_to_async(game.save)()
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'state',
				'action': 'end'
			}
		)
		
			

	async def send_game_state_to_players(self, game_state):
		# Player 1 sees the ball as is
		await self.channel_layer.send(
			game_state['players']['player1']['channel_name'],
			{
				'type': 'game',
				'game_state': game_state  # Send original ball position
			}
		)

		# Player 2 sees the ball with the X-axis mirrored
		mirrored_ball = game_state['ball'].copy()
		# canvas_width = 800  # Assuming canvas width of 800
		mirrored_ball['x'] = self.canvas_width - game_state['ball']['x']

		game_state_player2 = game_state.copy()
		game_state_player2['ball'] = mirrored_ball

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