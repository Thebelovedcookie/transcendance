from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'ws/ai/$', consumers.GameAiConsumer.as_asgi()),
]
