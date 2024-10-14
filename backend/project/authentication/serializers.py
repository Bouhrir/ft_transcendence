from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
import pyotp
import random
import requests
from django.core.files.base import ContentFile


class UserSerializer(serializers.ModelSerializer):
    image = serializers.URLField(required=False)  # No need for a default here
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
        print(imageChoice)
            
        user  = User.objects.create(**validated_data)
        user.set_password(validated_data['password'])
        user.save()

        totp_secret = pyotp.random_base32()
        user_profile = UserProfile.objects.create(user=user, totp_secret=totp_secret)


        # if (imageChoice):
        #     user_profile.image = image
        #     user_profile.save()
        # else:
        try:
            response = requests.get(image)
            if response.status_code == 200:
                user_profile.image.save(f"{user.username}_image.jpg", ContentFile(response.content))
            else:
                print(f"Failed to download image. Status code: {response.status_code}")
        except Exception as e:
            print(f"Error downloading image: {e}")
                

        # if image:
        #     user_profile.image = image
        #     user_profile.save()
        return user