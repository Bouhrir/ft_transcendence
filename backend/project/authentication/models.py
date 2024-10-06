from django.db import models
from django.contrib.auth.models import User
import pyotp
# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    totp_secret = models.CharField(max_length=50, default=pyotp.random_base32)
    is_2fa_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username