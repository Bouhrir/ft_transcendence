from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
import pyotp


class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        fields = ['id','username','first_name', 'last_name' ,'email', 'password']
    
    def validate(self, data):
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'This email is already in use.'})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({'username': 'username is already in use.'})
        return data

    def create(self, validated_data):
        user  = User.objects.create(**validated_data)
        user.set_password(validated_data['password'])
        user.save()

        totp_secret = pyotp.random_base32()
        UserProfile.objects.create(user=user, totp_secret=totp_secret)
        return user