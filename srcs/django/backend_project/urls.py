"""
URL configuration for tran_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
	https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
	1. Add an import:  from my_app import views
	2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
	1. Add an import:  from other_app.views import Home
	2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
	1. Import the include() function: from django.urls import include, path
	2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
	# path("", include("local_multi_game_app.urls")),
	path('admin/', admin.site.urls),
	# path("local_multi_game_app/", include("local_multi_game_app.urls")),
	path('api/', include("user_management_app.urls")),
	path("api/matches/", include("pong_history_app.urls")),
]

# api/ -> api/auth/
# backend_app/ -> api/pong/
