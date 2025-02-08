import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from django.urls import path
# from backend_app.routing import websocket_urlpatterns

import backend_app.routing
import remotePlayer_app.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(
#         URLRouter(websocket_urlpatterns)
#     ),
# })

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            backend_app.routing.websocket_urlpatterns + remotePlayer_app.routing.websocket_urlpatterns
        )
    ),
})