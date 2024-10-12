from django.urls import re_path
from . import consumers

#this file for handling websocket connections
websocket_urlpatterns = [
    # path(r'ws//$', consumers.SomeConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.SomeConsumer.as_asgi()),
]
#ws/some_path/ is the path where the WebSocket connections will be accepted
#SomeConsumer is the consumer that will handle the connections

