from django.db import models
from remote.models import Game
from django.contrib.auth.models import User

# Create your models here.
class Tournament(models.Model):
	is_active = models.BooleanField(default=True)  # To mark if the tournament is ongoing or completed
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tournament_wins')

	def __str__(self):
		return f"Tournament {self.name}"

class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="players")
	player = models.ForeignKey(User, on_delete=models.CASCADE)
	score = models.IntegerField(default=0)

	class Meta:
		unique_together = ('tournament', 'player')
	
	def __str__(self):
		return f"{self.player.username} in {self.tournament.name}"

class TournamentGame(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="games")
	game = models.ForeignKey(Game, on_delete=models.CASCADE)
	player1 = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, related_name='game_as_player1')
	player2 = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, related_name='game_as_player2')

	def __str__(self):
		return f"Game in {self.tournament.name}: {self.player1.player.username} vs {self.player2.player.username}"
