from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from remote.models import Game
from django.contrib.auth.models import User
from .models import Invitation
from django.db.models import Q
# from django.http import HttpResponse
from .models import Message, Room
from django.views import View
from django.http import HttpRequest
from django.http import JsonResponse
from django.contrib.auth.models import User


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



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def room(request):
    id1 = request.data['user1']
    id2 = request.data['user2']
    try:
        user1 = User.objects.get(id=id1)
        user2 = User.objects.get(id=id2)
    except KeyError:
        return Response({"error": "Invalid Users"}, status=status.HTTP_400_BAD_REQUEST)

    room = Room.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).first()
    if room:
        print(room.id)
        messages = Message.objects.filter(room=room)
        message_data = []
        for mmssg in messages:
            message_data.append({
            'id' : mmssg.id,
            'content' : mmssg.content,
            'sender' : mmssg.user_send.id,
            'time' : mmssg.date,
            })
        return Response({"room_id" : room.id, "messages" : message_data, "bol": True} ,status=status.HTTP_200_OK)
            
    else:
        room = Room.objects.create(user1=user1, user2=user2)
        return Response({"room_id": room.id, "bol": False}, status=status.HTTP_201_CREATED)

    # return render(request, 'chat/test.html')

def post(self, request):
    return render(request, 'chat/test.html')

