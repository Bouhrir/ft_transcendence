from django.shortcuts import render
import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status
from .models import Game
from django.db.models import Q


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_game(request):
	sender_id = request.user.id  # Get the invitee's ID from the authenticated user
	receiver_id = request.data.get('receiver_id')  # Get the inviter's username
	
	try:
		sender = User.objects.get(id=sender_id)
		receiver = User.objects.get(id=receiver_id)
		existing_game = Game.objects.filter(Q(host=sender, guest=receiver) | Q(guest=sender, host=receiver),status='waiting').last()
		# print(existing_game)
		if existing_game:
			return Response({'status': 'success', 'game_id': existing_game.id}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'No active game found.'}, status=status.HTTP_404_NOT_FOUND)
	except User.DoesNotExist:
		return Response({'error': 'Game not found.'}, status=status.HTTP_404_NOT_FOUND)
		# return Response({'status': 'success'}, status=status.HTTP_200_OK)