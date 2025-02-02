from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json
import datetime

def login_user(request):
	data = json.load(request)
	email = data.get('email')
	password = data.get('password')
	user = authenticate(email=email, password=password)
	if user is not None:
		login(request, user)
		return JsonResponse({
			'status': 'success',
			'message': 'user logged in'
		}, status=200)
	else:
		return JsonResponse({
			'status': 'failure',
			'message': 'bad user info'
		}, status=401)

def logout_user(request):
	if request.method == 'POST':
		logout(request)
		return JsonResponse({
			'status': 'success',
			'message': 'user logged out'
		}, status=200)
	else:
		return JsonResponse({
			'status': 'error',
			'message': 'invalid request method'
		}, status=405)

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

@login_required
def update_profile(request):
	print("Request method:", request.method)
	print("Request FILES:", request.FILES)
	print("Request POST:", request.POST)
	if (request.method != 'POST'):
		print(request.method)
		return JsonResponse({
			'status': 'error',
			'message' : 'Invalid request method'
		}, status=405)

	try:
		data = json.load(request)
		username = data.get('username')
		email = data.get('email')
		image = data.get('image')

		#load user data based on request.user email
		u = CustomUser.objects.get(email=request.user.email)

		# this will save the new user data to the database
		u.username = username
		u.email = email
		u.profile_image = image
		u.save()

		return JsonResponse({
			'status': 'success',
			'message': 'update made',
			#'data' : {
			#	'username': u.username,
			#	'email': u.email,
			#	'profile_image': u.profile_image
			#}
		}, status=200)
	except Exception as e:
		return JsonResponse({
			'status': 'success',
			'message': str("failed update")
		}, status=200)

@login_required
def get_profile(request):
	profile_image_url = None
	if request.user.profile_image:
		profile_image_url = request.user.profile_image.url
	return JsonResponse({
		'status': 'success',
		'data' : {
			'friends' : request.user.friends,
			'username': request.user.username,
			'email': request.user.email,
			'profile_image': profile_image_url,
			'wins': request.user.wins,
			'totalGames': request.user.totalGames,
			'losses': request.user.losses,
			'join_date': request.user.date_joined.strftime('%Y-%m-%d')
		}
	})

def get_user(request):
	if request.user.is_authenticated:
		return JsonResponse({
			'status': 'success',
			'data': {
				'username': request.user.username,
				'isAuthenticated': True
			}
		})
	else:
		return JsonResponse({
			'status': 'success',
			'data': {
				'isAuthenticated': False
			}
		})
