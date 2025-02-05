from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import PongMatchHistory

def get_user_matches(request):
	try:
		user = request.user
		match_history = PongMatchHistory.objects.filter(user=user).order_by('-played_at')[:10]

		# Convert match history to list of dictionaries
		matches_data = [
			{
				'id': match.id,
				'opponent': {
					'username': match.opponent.username,
					'profile_image': match.opponent.profile_image.url if match.opponent.profile_image else None
				},
				'user_score': match.user_score,
				'opponent_score': match.opponent_score,
				'played_at': match.played_at,
				'result': 'Win' if match.user_score > match.opponent_score else 'Loss'
			}
			for match in match_history
		]

		match_stats = {
			'total_games': PongMatchHistory.objects.filter(user=user).count(),
			'wins': PongMatchHistory.objects.filter(
				user=user,
				user_score__gt=models.F('opponent_score')
			).count(),
			'matches': matches_data
		}

		return JsonResponse({
			'status': 'success',
			'data': match_stats
		})

	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

@login_required
def record_match(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	try:
		data = json.loads(request.body)
		opponent_id = data.get('opponent_id')
		user_score = data.get('user_score')
		opponent_score = data.get('opponent_score')

		# Record match from user's perspective
		PongMatchHistory.objects.create(
			user=request.user,
			opponent_id=opponent_id,
			user_score=user_score,
			opponent_score=opponent_score
		)

		# Record match from opponent's perspective
		PongMatchHistory.objects.create(
			user_id=opponent_id,
			opponent=request.user,
			user_score=opponent_score,
			opponent_score=user_score
		)

		return JsonResponse({
			'status': 'success',
			'message': 'Match recorded successfully'
		})

	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)
