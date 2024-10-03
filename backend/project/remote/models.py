from django.db import models
# from django.contrib.auth.models import User

# class GameRoom(models.Model):
#     player1 = models.ForeignKey(User, related_name='player1_rooms', on_delete=models.CASCADE)
#     player2 = models.ForeignKey(User, related_name='player2_rooms', on_delete=models.CASCADE, null=True, blank=True)
#     status = models.CharField(max_length=20, default='waiting')  # e.g., waiting, active, finished
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Room: {self.id} - {self.player1} vs {self.player2 or 'Waiting for player'}"
