from django.db import models
from django.contrib.auth.models import User
# Create your models here.
#defines the data structure of your app (database tables)
# class User(models.Model):
#     name = models.CharField(max_length=200)
    
#     def __str__(self):
#         return self.name

class Message(models.Model):

    user_send = models.ForeignKey(User, related_name='sent_message' ,on_delete=models.CASCADE)
    user_receive = models.ForeignKey(User, related_name='received_message',on_delete=models.CASCADE, default=1)   
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.user_send} to {self.user_receive}'
    
    
    
#python3 manage.py makemigrations
#python3 manage.py migrate 
#we do this every time we add somethings in models
