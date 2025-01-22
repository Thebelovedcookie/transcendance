from django.http import JsonResponse
from django.middleware.csrf import get_token

def register_user(request):
    return JsonResponse({
        'status': 'success',
        'message': 'this is a test'
    }, status=200)

def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({
        'status': 'success',
        'csrf_token': csrf_token
    }, status=200)
