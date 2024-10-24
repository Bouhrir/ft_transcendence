from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
	host = models.ForeignKey(User, related_name='host', on_delete=models.CASCADE)
	guest = models.ForeignKey(User, related_name='guest', on_delete=models.CASCADE, null=True, blank=True)
	status = models.CharField(max_length=20, default='waiting')# e.g., waiting, active, finished, cancelled
	host_score = models.IntegerField(default=0)
	guest_score = models.IntegerField(default=0)
	winner = models.ForeignKey(User, related_name='winner', on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	room_name = models.CharField(max_length=50, unique=True, default="default")  # Add room_name here
	type = models.CharField(max_length=30, default='game')
	created_at = models.DateTimeField(auto_now_add=True)

	# Method to determine the winner based on scores
	def determine_winner(self):
		if self.host_score > self.guest_score:
			self.winner = self.host
		elif self.guest_score > self.host_score:
			self.winner = self.guest
		else:
			print("no winner detected")
		self.status = "finished"
		self.save()
		# return self.winner

	def get_player_score(self, player_id):
		if self.host.id == player_id:
			return self.host_score
		elif self.guest and self.guest.id == player_id:
			return self.guest_score
		else:
			raise ValueError("Player ID is not associated with this game.")

	def set_score(self, player_id, player_score, ai_score):
		if self.host.id == player_id:
			self.host_score = player_score
			self.guest_score = ai_score
		elif self.guest and self.guest.id == player_id:
			self.host_score = ai_score
			self.guest_score = player_score
		self.save()

	def set_status(self, status):
		self.status = status

	def set_guest_score(self, guest_score):
		# self.guest_score = guest_score
		setattr(self, 'guest_score', guest_score)

	def set_winner(self, winner):
		setattr(self, 'winner', winner)

	# Method to get the host
	def get_host(self):
		return self.host

	# Method to get the guest
	def get_guest(self):
		return self.guest
	
		# New method to check if a player is host or guest
	def get_player_role(self, player_id):
		if self.host.id == player_id:
			return "host"
		elif self.guest and self.guest.id == player_id:
			return "guest"
		return "not a participant"
