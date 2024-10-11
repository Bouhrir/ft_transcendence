# consumers.py
import json
from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync 
from .models import Message 
from django.contrib.auth.models import User
#here we are creating a class that inherits from AsynchronousWebsocketConsumer and we are overriding the connect, disconnect and receive methods

class SomeConsumer(JsonWebsocketConsumer):
    from .models import Message 
    
    connections = []
    
    def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_group_name
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        self.connections.append(self)
        # user = self.scope['user']  # Assuming user is authenticated and in the session
        # if user.is_authenticated:
        #     self.connections.add(user.id)  # Add user id to the set of connections
        
    def disconnect(self):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )
        self.connections.remove(self)
        # user = self.scope['user']
        # if user.is_authenticated:
        #     self.connections.discard(user.id)  # Remove user from connections
        
        
    def receive(self, data):
        # print("test/n")
        data_json = json.loads(data)
        
        message = data_json['msg']
        sender_id = data_json['snd_id']
        receiver_id = data_json['rec_id']        
        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:
            pass
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            pass
        
        # self.save_message(sender, receiver, message)
        #receive method is called when the connection receives a message
        
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, {
                'type': "chat.message",
                'data': {
                    'msg': message,
                    'snd_id': sender_id,
                    'rec_id': receiver_id
                }
            })
    
    # def get_receive_chanel_name(self, receiver):
    #     for connection in self.connections:
    #         if connection.scope['user'] == receiver:
    #             return connection.channel_name
    #     return None
        
    def chat_message(self, event):
        # event['data']
        print('=======')
        print(event['data'])
        print('=======')
        
        self.send(text_data=json.dumps(event['data']))
    
    def save_message(self, sende_id, receiver_id, message):
        Message.objects.create(user_send=sende_id, user_receive=receiver_id, content=message)
   
            
# python3 -m venv .venv  
# source .venv/bin/activate  
# pip3 install --upgrade pip  
# python3 -m pip install -U channels["daphne"] ****or***** pip3 install -U "channels[daphne]"
