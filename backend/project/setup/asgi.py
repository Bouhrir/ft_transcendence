"""
ASGI config for project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
# from chat.routing import websocket_urlpatterns1

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
import django
django.setup()
from remote.routing import websocket_urlpatterns as remote_websocket_urlpatterns
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from tournament.routing import websocket_urlpatterns as tournament_websocket_urlpatterns

websocket_urlpatterns = remote_websocket_urlpatterns + chat_websocket_urlpatterns + tournament_websocket_urlpatterns


application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
