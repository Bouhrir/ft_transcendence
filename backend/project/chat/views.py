from django.shortcuts import render
from django.shortcuts import render
import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from remote.models import Game

def main(request):
	return render(request, '/index.html')
 
from django.contrib.auth.models import User
from .models import Invitation
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
	if request.method == 'POST':
		# Check if the tournament already exists
		if Tournament.objects.exists():
			return JsonResponse({'message': 'Tournament already exists'}, status=400)

		# Create a new tournament if one doesn't exist
		tournament = Tournament.objects.create()
		return JsonResponse({'message': 'Tournament created successfully', 'tournament_id': tournament.id}, status=201)

	return JsonResponse({'error': 'Invalid request method'}, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invitation(request):
	inviter_id = request.user.id  # Get the invitee's ID from the authenticated user
	invitee_id = request.data.get('invitee_id')  # Get the inviter's username
	room_name = f"room_{uuid.uuid4().hex}"
	
	try:
		inviter = User.objects.get(id=inviter_id)
		invitee = User.objects.get(id=invitee_id)
		existing_invitation = Invitation.objects.filter(
			inviter=inviter,
			invitee=invitee,
			status='pending'
		).first()

		if existing_invitation:
			return JsonResponse({'error': 'An invitation is already pending.'}, status=400)

		# Create a new invitation
		invitation = Invitation.objects.create(inviter=inviter, invitee=invitee, room_name=room_name)
		game = Game.objects.create(host_id=inviter_id, guest_id=invitee_id, room_name=room_name)
		# invitation.save()
		return Response({'status': 'success', 'room_name': room_name}, status=status.HTTP_200_OK)
	except User.DoesNotExist:
		print("user doesn't exist")
		return Response({'error': 'Inviter not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invitation(request):
	invitee_id = request.user.id  # Get the invitee's ID from the authenticated user
	inviter_id = request.data.get('inviter_id')  # Get the inviter's username

	try:
		# Find the inviter by username
		inviter = User.objects.get(id=inviter_id)
		invitee = User.objects.get(id=invitee_id)
		
		# Retrieve the invitation
		invitation = Invitation.objects.get(invitee=invitee, inviter=inviter, status="pending")

		# Update the invitation status to accepted
		invitation.status = 'accepted'
		invitation.save()

		# Respond with the room name to join the game
		return Response({'status': 'success', 'room_name': invitation.room_name}, status=status.HTTP_200_OK)

	except Invitation.DoesNotExist:
		return Response({'error': 'Invitation does not exist.'}, status=status.HTTP_404_NOT_FOUND)
	except User.DoesNotExist:
		return Response({'error': 'Inviter not found.'}, status=status.HTTP_404_NOT_FOUND)

# maybe delete one invite not all of them
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_invitations(request):
	inviter_id = request.user.id  # Get the invitee's ID from the authenticated user
	invitee_username = request.data.get('invitee_username')  # Get the inviter's username

	try:
		invitee = User.objects.get(username=invitee_username)  # Get the inviter object
		inviter = User.objects.get(id=inviter_id)

		# Remove the invitations where the invitee and inviter match
		deleted_count, _ = Invitation.objects.filter(inviter=inviter, invitee=invitee).delete()
		print(deleted_count)
		if deleted_count == 0:
			return Response({"message": "No invitations found to delete."}, status=status.HTTP_404_NOT_FOUND)

		return Response({"message": "Invitations deleted successfully."}, status=status.HTTP_200_OK)

	except User.DoesNotExist:
		return Response({"message": "Inviter not found."}, status=status.HTTP_404_NOT_FOUND)