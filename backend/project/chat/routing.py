from django.urls import path
from . import consumers

#this file for handling websocket connections
websocket_urlpatterns = [
    path(r'ws/<str:room_name>/$', consumers.SomeConsumer.as_asgi()),
]
#ws/some_path/ is the path where the WebSocket connections will be accepted
#SomeConsumer is the consumer that will handle the connections

