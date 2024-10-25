# consumers.py
import json
from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync 
from .models import Message , Room
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError
from jwt import decode, ExpiredSignatureError, DecodeError
from django.contrib.auth.models import User
from django.contrib.auth.models import AnonymousUser
#here we are creating a class that inherits from AsynchronousWebsocketConsumer and we are overriding the connect, disconnect and receive methods

class SomeConsumer(JsonWebsocketConsumer):
    connections = []
    
    def connect(self):
        cookie_value = self.scope['cookies'].get('access')
        # print(cookie_value)
        if cookie_value:
            try:
                payload = decode(cookie_value, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get('user_id')
                self.scope['user'] = User.objects.get(id=user_id)
            except (ExpiredSignatureError, DecodeError, User.DoesNotExist, TokenError):
                self.scope['user'] = AnonymousUser()
        else:
            self.scope['user'] = AnonymousUser()

        if self.scope['user'].is_authenticated:
            self.accept()
        else:
            self.close()
            return
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
    def disconnect(self, close_code):
        if hasattr(self, self.room_group_name):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name,
            )
        
        
    def receive(self, text_data):
        data_json = json.loads(text_data)
        
        message = data_json['msg']
        sender_id = data_json['snd_id']
        receiver_id = data_json['rec_id']
        room_id = data_json['room_id']  
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            room = Room.objects.get(id=room_id)
        except User.DoesNotExist:
            return
    
        self.save_message(sender, receiver, message, room)
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, {
                'type': "chat.message",
                'data': {
                    'msg': message,
                    'snd_id': sender_id,
                    'rec_id': receiver_id,
                    'room_id': room.id,
                }
            })     
    def chat_message(self, event):
        self.send(text_data=json.dumps(event['data']))
    
    def save_message(self, sende_id, receiver_id, message, room):
        Message.objects.create(user_send=sende_id, user_receive=receiver_id, content=message, room=room)
