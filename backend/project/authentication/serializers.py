from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
import pyotp
import random


class UserSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)  # No need for a default here
    class Meta(object):
        model = User
        fields = ['id','username','first_name', 'last_name' ,'email', 'password', 'image']
        
    
    def validate(self, data):
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'This email is already in use.'})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({'username': 'username is already in use.'})
        return data

    def create(self, validated_data):
        default_images = ['droke.png', 'miroka.png', 'oussama.png', 'sefrioui.png']
        imageChoice = random.choice(default_images)
        
        image = validated_data.pop('image', imageChoice)
            
        user  = User.objects.create(**validated_data)
        user.set_password(validated_data['password'])
        user.save()

        totp_secret = pyotp.random_base32()
        user_profile = UserProfile.objects.create(user=user, totp_secret=totp_secret)

        if image:
            user_profile.image = image
            user_profile.save()
        return user