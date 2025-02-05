from django.urls import path
from django.conf import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
    path('register', views.register_user),
    path('login', views.login_user),
	path('logout', views.logout_user),
    path('csrf', views.get_csrf_token),
	path('profile/update', views.update_profile, name='update_profile'),
	path('profile/get', views.get_profile, name='get_profile'),
	path('user', views.get_user, name='get_user'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
	