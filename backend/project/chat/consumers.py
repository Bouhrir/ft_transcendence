import json
from channels.generic.websocket import JsonWebsocketConsumer
from .models import Message 
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
#here we are creating a class that inherits from AsynchronousWebsocketConsumer and we are overriding the connect, disconnect and receive methods

class SomeConsumer(JsonWebsocketConsumer):
    
    connections = []
    
    def connect(self):
        self.accept()
        self.connections.append(self)
        # user = self.scope['user']  # Assuming user is authenticated and in the session
        # if user.is_authenticated:
        #     self.connections.add(user.id)  # Add user id to the set of connections
        
    def disconnect(self, close_code):
        self.connections.remove(self)
        # user = self.scope['user']
        # if user.is_authenticated:
        #     self.connections.discard(user.id)  # Remove user from connections
        
        
    def receive(self, data):
        print("test/n")
        data_json = json.loads(data)
        
        message = data_json['msg']
        sender_id = data.json['snd_id']
        receiver_id = data.json['rec_id']
        
        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist():
            return None
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist():
            return None
        
        self.save_message(sender, receiver, message)
        #receive method is called when the connection receives a message
        
        receiver_chan_nam = self.get_receive_chanel_name(receiver)
        if receiver_chan_nam:
            async_to_sync(self.channel_layer.send)(receiver_chan_nam, {
                'type': "chat.message",
                'data': {
                    'msg': message,
                    'snd_id': sender_id,
                    'rec_id': receiver_id
                }
            })
            self.send(text_data=json.dumps({
                'msg': message,
                'snd_id': sender_id,
                'rec_id': receiver_id
            }))
    
    def get_receive_chanel_name(self, receiver):
        for connection in self.connections:
            if connection.scope['user'] == receiver:
                return connection.channel_name
        return None
        
    def chat_message(self, event):
        event['data']
        self.send(text_data=json.dumps(event['data']))
    
    def save_message(self, sende_id, receiver_id, message):
        Message.objects.create(user_send=sende_id, user_receive=receiver_id, content=message)
   
            
# python3 -m venv .venv  
# source .venv/bin/activate  
# pip3 install --upgrade pip  
# python3 -m pip install -U channels["daphne"] ****or***** pip3 install -U "channels[daphne]"