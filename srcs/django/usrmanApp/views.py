from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser

import json

def register_user(request):
    data = json.load(request)
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    user = CustomUser.objects.create_user(username=username, email=email, password=password)
    return JsonResponse({
        'status': 'success',
        'message': 'user registered'
    }, status=200)

def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({
        'status': 'success',
        'csrf_token': csrf_token
    }, status=200)
