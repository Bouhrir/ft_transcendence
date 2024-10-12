from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
	host = models.ForeignKey(User, related_name='host', on_delete=models.CASCADE)
	guest = models.ForeignKey(User, related_name='guest', on_delete=models.CASCADE, null=True, blank=True)
	status = models.CharField(max_length=20, default='waiting')# e.g., waiting, active, finished
	host_score = models.IntegerField(default=0)
	guest_score = models.IntegerField(default=0)
	winner = models.ForeignKey(User, related_name='winner', on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Room: {self.id} - {self.player1} vs {self.player2 or 'Waiting for player'}"

