from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser
from django.contrib.auth import authenticate

import json

def login_user(request):
    data = json.load(request)
    email = data.get('email')
    password = data.get('password')
    user = authenticate(email=email, password=password)
    if user is not None:
        return JsonResponse({
            'status': 'failure',
            'message': 'user info bad'
        }, status=200)
    else:
        return JsonResponse({
            'status': 'success',
            'message': 'user logged in'
        }, status=200)


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
