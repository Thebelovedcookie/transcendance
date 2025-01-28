from django.urls import path
from django.conf import settings
from . import views

urlpatterns = [
    path('register', views.register_user),
    path('login', views.login_user),
    path('csrf', views.get_csrf_token),
]
