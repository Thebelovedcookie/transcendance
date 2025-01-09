from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
	path("", views.index, name="index"),
    path("home", views.home, name="home"),
    path("pong", views.pong, name="pong"),
    path("pong/normal", views.pong_normal, name="pong_normal"),
    path("pong/solo", views.pong_solo, name="pong_solo"),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
