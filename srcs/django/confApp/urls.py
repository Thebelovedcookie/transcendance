from django.urls import path
from django.conf import settings
from . import views

urlpatterns = [
	path("apiiii/", views.sendPosition, name="sendPosition"),
]
