import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from django.urls import path
from gameMulti_app.routing import websocket_urlpatterns as gameMulti_app_ws
from localNormalGame_app.routing import websocket_urlpatterns as localNormalGame_ws
from tournement_app.routing import websocket_urlpatterns as tournement_ws
from remotePlayer_app.routing import websocket_urlpatterns as remote_player_app_ws
from online_status_app.routing import websocket_urlpatterns as onlineStatus_ws
from channels.auth import AuthMiddlewareStack

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(
#         URLRouter(websocket_urlpatterns)
#     ),
# })

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AllowedHostsOriginValidator(
		AuthMiddlewareStack(
			URLRouter(
				gameMulti_app_ws +
				localNormalGame_ws +
				tournement_ws +
				remote_player_app_ws +
				onlineStatus_ws
				)
			)
	),
})
