from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2')

class Message(models.Model):
    user_send = models.ForeignKey(User, related_name='sent_message' ,on_delete=models.CASCADE, default=1)
    user_receive = models.ForeignKey(User, related_name='received_message',on_delete=models.CASCADE, default=1)   
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_messages', null=True)
    def __str__(self):
        return f'{self.user_send} to {self.user_receive}'

class Invitation(models.Model):
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_sent')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_received')
    room_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='pending')  # e.g., pending, accepted, cancelled

    def __str__(self):
        return f"Invitation from {self.inviter} to {self.invitee} for {self.room_name} (Status: {self.status})"