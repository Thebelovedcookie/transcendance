from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json

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
		# profile_image = request.FILES.get('profile_image')
		# if (profile_image):
		# 	request.user.profile_image = profile_image

		data = json.loads(request.POST.get('data', '{}'))
		print(data['username'])
		print(data['email'])
		if ('username' in data):
			request.user.username = data['username']
		if ('email' in data):
			request.user.email = data['email']

		print(request.user.username)
		print(request.user.email)

		request.user.save()

		return JsonResponse({
			'status': 'success',
			'message': 'Profile updated',
			'data' : {
				'username': request.user.username,
				'email': request.user.email,
				# 'profile_image': request.user.profile_image.url
			},
		}, status=200)
	except Exception as e:
		return JsonResponse({
			'status': 'success',
			'message': str("test")
		}, status=200)

@login_required
def get_profile(request):
	profile_image_url = None
	if request.user.profile_image:
		profile_image_url = request.user.profile_image.url
	return JsonResponse({
		'status': 'success',
		'data' : {
			'username': request.user.username,
			'email': request.user.email,
			'profile_image': profile_image_url,
			'join_date': request.user.date_joined.strftime('%Y-%m-%d')
		}
	})

def get_user(request):
	if request.user.is_authenticated:
		return JsonResponse({
			'status': 'success',
			'data': {
				'username': request.user.username,
				'email': request.user.email
			}
		})
	else:
		return JsonResponse({
			'status': 'error',
			'message': 'User not authenticated'
		}, status=401)
