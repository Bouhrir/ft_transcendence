from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
# from django.http import HttpResponse
from .models import Message, Room
from django.views import View
from django.http import HttpRequest
from django.http import JsonResponse
from django.contrib.auth.models import User

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
        return Response({"room_id" : room.id, "messages" : message_data}, status=status.HTTP_200_OK)
            
    else:
        room = Room.objects.create(user1=user1, user2=user2)
        return Response({"room_id": room.id}, status=status.HTTP_201_CREATED)

    # return render(request, 'chat/test.html')

def post(self, request):
    return render(request, 'chat/test.html')