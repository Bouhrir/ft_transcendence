import json
from channels.generic.websocket import AsyncWebsocketConsumer
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

# from channels.generic.websocket import AsyncWebsocketConsumer
# from rest_framework_simplejwt.tokens import UntypedToken
# from rest_framework_simplejwt.exceptions import InvalidToken
# from django.contrib.auth.models import AnonymousUser
# from jwt import decode as jwt_decode
# from django.conf import settings
# from myapp.models import CustomUser
# Ball collision with top and bottom walls
#  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
#     ball.dy *= -1;
#  }

# Ball goes off the screen
#     if (ball.x - ball.radius < 0) {
#         aiScore++;
#         resetBall();
#     } else if (ball.x + ball.radius > canvas.width) {
#         playerScore++;
#         resetBall();
#     }


# Check paddle collision
# if (ball.x - ball.radius < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height) {
#         ball.dx *= -1;
#     }
#     if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + ai.height) {
#         ball.dx *= -1;
#     }

def reset_ball():
    return {
            'x': 400,
            'y': 300,
            'dx': 6 * -1,#(1 if random.random() > 0.5 else -1),
            'dy': 6 * 1#(1 if random.random() > 0.5 else -1),
        }

def check_wall_collision(ball):
    ball_radius = 10
    canvas_height = 600
    if (ball['y'] + ball_radius > canvas_height or ball['y'] - ball_radius < 0):
        ball['dy'] *= -1
    return ball

def check_paddle_collision(ball, player):
    # player = players["player1"]
    ball_radius = 10
    canvas_height = 600
    player_height = 100
    canvas_width = 800
    player_width = 10
    ai_height = 100
    ai_width = 10
    player_x = 0 
    ai_x = canvas_width - ai_width
    ball_dx = 5 
    ball_x = canvas_width / 2
    # #check top bottom
    # if (ball['y'] + ball_radius > canvas_height or ball['y'] - ball_radius < 0):
    #     ball['dy'] *= -1
    #check paddle collision with ball
    if (ball['x'] - ball_radius < player_x + player_width and ball['y'] > player["player_y"] and ball['y'] < player["player_y"] + player_height):
        ball['dx'] *= -1
    if (ball['x'] + ball_radius > ai_x and ball['y'] > player["ai_y"] and ball['y'] < player["ai_y"] + ai_height):
        ball['dx'] *= -1
    # Ball goes off the screen
    if (ball['x'] - ball_radius < 0):
        player["ai_score"] += 1
        #ai
        return reset_ball()
    elif (ball['x'] + ball_radius > canvas_width):
        player["player_score"] += 1
        #player
        return reset_ball()
    return ball


def check_paddle_boundaries(player):
    if (player["player_y"] < 0):
        player["player_y"] = 0
    if (player["player_y"] + 100 > 600):
        player["player_y"] = 600 - 100
    if (player["ai_y"] < 0):
        player["ai_y"] = 0
    if (player["ai_y"] + 100 > 600):
        player["ai_y"] = 600 - 100
    return player

class PongConsumer(AsyncWebsocketConsumer):
    game_states = {}
    async def initialize_game_state(self, room_name):
        self.game_states[room_name] = {
            "ball": {
                'x': 400,
                'y': 300,
                'dx': 6 * (1 if random.random() > 0.5 else -1),
                'dy': 6 * (1 if random.random() > 0.5 else -1),
            },
            "players": {
                "player1": {
                    "id": None,
                    "channel_name": None,
                    "player_y": 250,
                    "player_dy": 0,
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
    async def connect(self):
        from django.contrib.auth.models import User
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
            # print(self.scope['user'])
            await self.accept() # Accept the WebSocket connection
        else:
            await self.close()  # Close connection if not authenticated
            return
        self.player_id = self.scope["user"].id
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        # print(self.room_name)
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        # print(f"Connecting to room: {self.room_name}")  # Add this to debug
        self.room_group_name = f"pong_{self.room_name}"
        if self.room_name not in self.game_states:
            await self.initialize_game_state(self.room_name)
        await self.setPlayers(self.room_name)
        await self.send(text_data=json.dumps({
            'action': 'new_connection',
            'player_id': self.scope['user'].id
        }))
        # await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        if self.game_states[self.room_name]["players"]["player1"]["id"] is not None and self.game_states[self.room_name]["players"]["player2"]["id"] is not None:
            asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        print("disconnect")
        # await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

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


# Check for wall collisions
# if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 600:
#     self.game_state['ball']['dy'] *= -1  # Reverse vertical direction
# if self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800:
#     self.game_state['ball']['dx'] *= -1  # Reverse horizontal direction




    async def game_loop(self):
        # game_state = self.game_states[self.room_name]
        # print(game_state)
        # return 
        while True:
            # Update ball position
            self.game_states[self.room_name]['ball']['x'] += self.game_states[self.room_name]['ball']['dx']
            self.game_states[self.room_name]['ball']['y'] += self.game_states[self.room_name]['ball']['dy']
            self.game_states[self.room_name]["players"]["player1"]["player_y"] += self.game_states[self.room_name]["players"]["player1"]["player_dy"]
            self.game_states[self.room_name]["players"]["player1"]["ai_y"] += self.game_states[self.room_name]["players"]["player1"]["ai_dy"]
            self.game_states[self.room_name]["players"]["player2"]["player_y"] += self.game_states[self.room_name]["players"]["player2"]["player_dy"]
            self.game_states[self.room_name]["players"]["player2"]["ai_y"] += self.game_states[self.room_name]["players"]["player2"]["ai_dy"]

            self.game_states[self.room_name]['ball'] = check_wall_collision(self.game_states[self.room_name]['ball'])
            self.game_states[self.room_name]['ball'] = check_paddle_collision(self.game_states[self.room_name]['ball'], self.game_states[self.room_name]['players']["player1"])

            #Ensure paddle stays within canvas bounds
            self.game_states[self.room_name]["players"]["player1"] = check_paddle_boundaries(self.game_states[self.room_name]["players"]["player1"])
            self.game_states[self.room_name]["players"]["player2"] = check_paddle_boundaries(self.game_states[self.room_name]["players"]["player2"])

            
            # await asyncio.gather()
            await self.send_game_state_to_players(self.game_states[self.room_name])
            await asyncio.sleep(1/60)
            

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
        canvas_width = 800  # Assuming canvas width of 800
        mirrored_ball['x'] = canvas_width - game_state['ball']['x']

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

    



# if (self.game_state["player"]["paddle_y"] < 0):
            #     self.game_state["player"]["paddle_y"] = 0
            # if (self.game_state["player"]["paddle_y"] + 100 > 600):
            #     self.game_state["player"]["paddle_y"] = 600 - 100
            # if (self.game_state["ai"]["paddle_y"] < 0):
            #     self.game_state["ai"]["paddle_y"] = 0
            # if (self.game_state["ai"]["paddle_y"] + 100 > 600):
            #     self.game_state["ai"]["paddle_y"] = 600 - 100





    # async def ball_position(self, event):
    #     await self.send(bytes_data=event['data'])

# packed_data = struct.pack('ffff', self.ball_state['x'], self.ball_state['y'], self.ball_state['dx'], self.ball_state['dy'])
#             await asyncio.gather(
#             self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'ball_position',
#                     'data': packed_data  # Send the packed binary data
#                 }
#             ),
#             asyncio.sleep(1/60) # 60 FPS
#         )