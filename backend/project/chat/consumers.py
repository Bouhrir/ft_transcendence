# consumers.py
import json
from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync 
from .models import Message , Room
from django.contrib.auth.models import User
#here we are creating a class that inherits from AsynchronousWebsocketConsumer and we are overriding the connect, disconnect and receive methods

class SomeConsumer(JsonWebsocketConsumer):
    connections = []
    
        # self.room_group_name = 'chat_%s' % self.room_group_name
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        print("test")
        # self.connections.append(self)
        # user = self.scope['user']  # Assuming user is authenticated and in the session
        # if user.is_authenticated:
        #     self.connections.add(user.id)  # Add user id to the set of connections
        
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )
        # if self in self.connections:
            # self.connections.remove(self)
        # user = self.scope['user']
        # if user.is_authenticated:
        #     self.connections.discard(user.id)  # Remove user from connections
        
        
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
   
            
# python3 -m venv .venv  
# source .venv/bin/activate  
# pip3 install --upgrade pip  
# python3 -m pip install -U channels["daphne"] ****or***** pip3 install -U "channels[daphne]"



    # def get_receive_chanel_name(self, receiver):
    #     for connection in self.connections:
    #         if connection.scope['user'] == receiver:
    #             return connection.channel_name
    #     return None