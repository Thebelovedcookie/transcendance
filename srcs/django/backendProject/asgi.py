import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from django.urls import path
from backend_app.routing import websocket_urlpatterns as backend_app_ws
from backend_gamecons_app.routing import websocket_urlpatterns as backend_gamecons_ws
from backend_tour_app.routing import websocket_urlpatterns as backend_tour_ws
from remotePlayer_app.routing import websocket_urlpatterns as remote_player_app_ws
from online_status_app.routing import websocket_urlpatterns as onlineStatus_ws
from backend_project.middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AllowedHostsOriginValidator(
		JWTAuthMiddlewareStack(
			URLRouter(
				backend_app_ws +
				backend_gamecons_ws +
				backend_tour_ws +
				remote_player_app_ws +
				onlineStatus_ws
			)
		)
	),
})
