from django.shortcuts import render

# Create your views here.
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def progress(request):
# 	try:
# 		tournament = Tournament.objects.get(is_active=True)
# 		# Retrieve all players who have joined the tournament
# 		players = TournamentPlayer.objects.filter(tournament=tournament).select_related('player')

# 		# Prepare the data to return as JSON
# 		for player in players:
# 			print(player.player.username)
# 		player_data = [{'username': player.player.username, 'score': player.score} for player in players]
# 		# Return the data in JSON format
# 		return JsonResponse({'status': 'success', 'players': player_data})
# 		# return JsonResponse({'status': 'success', 'room_name': room_name})
# 	except Tournament.DoesNotExist:
# 		return JsonResponse({'status': 'error', 'message': 'Tournament not found'}, status=404)
# 	except User.DoesNotExist:
# 		return Response({'error': 'Inviter not found.'}, status=status.HTTP_404_NOT_FOUND)
	
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def join_tournament(request):