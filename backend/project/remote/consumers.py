import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import random
import time

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'pong_game'
        await self.accept()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)


    async def game_loop(self):
        self.ball_state = {
                'x': 800 / 2,
                'y': 600 / 2,
                'dx': 4 * (1 if random.random() > 0.5 else -1),  # Horizontal speed
                'dy': 4 * (1 if random.random() > 0.5 else -1),  # Vertical speed
            }
        while True:
            # Update ball position
            self.ball_state['x'] += self.ball_state['dx']
            self.ball_state['y'] += self.ball_state['dy']

            # Check for wall collisions
            if self.ball_state['y'] <= 0 or self.ball_state['y'] >= 600:
                self.ball_state['dy'] *= -1  # Reverse vertical direction
            if self.ball_state['x'] <= 0 or self.ball_state['x'] >= 800:
                self.ball_state['dx'] *= -1  # Reverse horizontal direction
            # await self.send_bytes(packed_data) 
            # Broadcast ball position to all clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ball_position',
                    'ball_state': self.ball_state
                }
            )
            # Sleep to simulate 60 FPS (1000ms / 60 = 16.67ms)
            await asyncio.sleep(1/60)

    async def ball_position(self, event):
        await self.send(text_data=json.dumps({
            'action': "ball_position",
            # 'player_id': event['player_id'],
            'ball_state': event['ball_state']
        }))
