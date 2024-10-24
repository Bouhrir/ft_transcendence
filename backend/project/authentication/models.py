from django.db import models
from django.contrib.auth.models import User
import pyotp
# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='media/', null=True, blank=True)
    totp_secret = models.CharField(max_length=50, default=pyotp.random_base32)
    is_2fa_enabled = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', blank=True)
    friend_requests = models.ManyToManyField('self', blank=True, symmetrical=False)

    def __str__(self):
        return self.user.username