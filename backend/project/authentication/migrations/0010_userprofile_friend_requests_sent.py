# Generated by Django 3.2.7 on 2024-10-21 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0009_auto_20241017_1412'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='friend_requests_sent',
            field=models.ManyToManyField(blank=True, related_name='_authentication_userprofile_friend_requests_sent_+', to='authentication.UserProfile'),
        ),
    ]
