from django.urls import path
from django.conf import settings

from . import views

urlpatterns = [
	path("api/", views.blabla, name="blabla"),
]
