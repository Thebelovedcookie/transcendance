from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser, EmailVerification
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json
from pong_history_app import views as pong_history_app
from online_status_app.models import OnlineStatus
# experiemnting from here
from PIL import Image
from django.core.files.storage import FileSystemStorage
from django.utils.translation import gettext as _
from django.conf import settings
from datetime import datetime, timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
import random
from django.utils import timezone

def require_login(view_func):
	def wrapper(request, *args, **kwargs):
		if not request.user.is_authenticated:
			return JsonResponse({
				'status': _('error'),
				'message': _('Authentication required'),
				'code': _('not_authenticated')
			}, status=401)
		return view_func(request, *args, **kwargs)
	return wrapper

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

def get_csrf_token(request):
	csrf_token = get_token(request)
	return JsonResponse({
		'status': 'success',
		'csrf_token': csrf_token
	}, status=200)

def register_user(request):
	data = json.load(request)
	username = data.get('username')
	email = data.get('email')
	password = data.get('password')

	# Check if user already exists
	if CustomUser.objects.filter(email=email).exists():
		return JsonResponse({
			'status': 'error',
			'message': 'Email already registered'
		}, status=400)

	is_active = False
	user = CustomUser.objects.create_user(
		username=username,
		email=email,
		password=password,
		is_active=is_active
	)

	return JsonResponse({
		'status': 'success',
		'message': 'Verification email sent'
	}, status=200)

# this func is executed when a new user is created
@receiver(post_save, sender=CustomUser)
def send_email_verification(sender, instance, created, **kwargs):
	if created and not instance.is_active:
		# Generate 6-digit verification code
		verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

		# Create verification token
		EmailVerification.objects.create(
			user=instance,
			verification_code=verification_code
		)

		# Send email
		subject = 'Please Activate Your Account'
		message = f'Your verification code is: {verification_code}'
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [instance.email]

		send_mail(subject, message, from_email, recipient_list)

def resend_verification(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	data = json.load(request)
	email = data.get('email')

	try:
		user = CustomUser.objects.get(email=email, is_active=False)

		# Delete existing verification
		EmailVerification.objects.filter(user=user).delete()

		# Generate new verification code
		verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

		# Create new verification
		EmailVerification.objects.create(
			user=user,
			verification_code=verification_code
		)

		# Send email
		subject = 'New Verification Code'
		message = f'Your new verification code is: {verification_code}'
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [email]

		send_mail(subject, message, from_email, recipient_list)

		return JsonResponse({
			'status': 'success',
			'message': 'New verification code sent'
		})

	except CustomUser.DoesNotExist:
		return JsonResponse({
			'status': 'error',
			'message': 'User not found or already activated'
		}, status=404)

def verify_email(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	data = json.load(request)
	email = data.get('email')
	verification_code = data.get('code')

	try:
		user = CustomUser.objects.get(email=email, is_active=False)
		verification = EmailVerification.objects.get(
			user=user,
			verification_code=verification_code
		)

		if verification.expires_at < timezone.now():
			return JsonResponse({
				'status': 'error',
				'message': 'Verification code expired'
			}, status=400)

		user.is_active = True
		user.save()

		# Delete verification after successful activation
		verification.delete()

		return JsonResponse({
			'status': 'success',
			'message': 'Email verified successfully'
		})

	except (CustomUser.DoesNotExist, EmailVerification.DoesNotExist):
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid verification code'
		}, status=400)

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
		# retreive data from POST
		username = request.POST.get('username')
		email = request.POST.get('email')
		uploaded_image = request.FILES.get('image')

		# fetch the user info based on surrent request.user.email
		u = CustomUser.objects.get(email=request.user.email)

		if uploaded_image:
			#delete current profile image
			if u.profile_image:
				u.profile_image.delete()
			# store new profile image
			u.profile_image = uploaded_image

		# save new username and email
		u.username = username
		u.email = email
		u.save()

		return JsonResponse({
			'status': 'success',
			'message': 'profile updated'
		}, status=200)
	except Exception as e:
		return JsonResponse({
			'status': 'success',
			'message': str("failed update")
		}, status=200)

@require_login
def get_profile(request):
	user = request.user

	match_response = pong_history_app.get_user_matches(request)
	match_data = json.loads(match_response.content)['data']

	friends_data = [
		{
			'id': friend.id,
			'username': friend.username,
			'profile_image': friend.profile_image.url if friend.profile_image else None,
			'is_online': OnlineStatus.objects.get(user_id=friend.id).is_online if OnlineStatus.objects.filter(user_id=friend.id).exists() else False,
			'lastSeen': friend.last_login,
			'wins': friend.wins,
			'losses': friend.losses,
			'totalGames': friend.totalGames
		}
		for friend in user.friends.all()
	]

	return JsonResponse({
		'status': 'success',
		'data': {
			'username': user.username,
			'email': user.email,
			'join_date': user.date_joined,
			'total_games': match_data['total_games'],
			'wins': match_data['wins'],
			'losses': match_data['losses'],
			'win_percent': match_data['win_percent'],
			'image_path': user.profile_image.url if user.profile_image else None,
			'friends': friends_data,
			'match_history': match_data['matches'],
			'is_online': True
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

def search_user(request):
	try:
		data = json.loads(request.body)
		search_term = data.get('search_term', '')

		if not search_term:
			return JsonResponse({
				'status': 'success',
				'data': []
			})

		users = CustomUser.objects.filter(
			username__icontains=search_term
		).exclude(
			username=request.user.username
		)

		users_data = [
			{
				'id' : user.id,
				'username': user.username,
				'profile_image': user.profile_image.url if user.profile_image else None,
				'is_online': False,
				'is_friend': request.user.friends.filter(id=user.id).exists()
			}
			for user in users
		]

		return JsonResponse({
			'status': 'success',
			'data': users_data
		})

	except json.JSONDecodeError:
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid JSON data'
		}, status=400)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

def add_friend(request):
	try:
		data = json.loads(request.body)
		friend_id = data.get('friend_id')

		friend = CustomUser.objects.get(id=friend_id)
		request.user.friends.add(friend)
		request.user.save()

		return JsonResponse({
			'status': 'success',
			'message': 'friend added'
		}, status=200)
	except CustomUser.DoesNotExist:
		return JsonResponse({
			'status': 'error',
			'message': 'User not found'
		}, status=404)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

def remove_friend(request):
	try:
		data = json.loads(request.body)
		friend_id = data.get('userid')

		friend = CustomUser.objects.get(id=friend_id)
		request.user.friends.remove(friend)
		request.user.save()

		return JsonResponse({
			'status': 'success',
			'message': 'friend removed'
		}, status=200)
	except CustomUser.DoesNotExist:
		return JsonResponse({
			'status': 'error',
			'message': 'User not found'
		}, status=404)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)
