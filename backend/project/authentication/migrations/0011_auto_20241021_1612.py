# Generated by Django 3.2.7 on 2024-10-21 16:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0010_userprofile_friend_requests_sent'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='friend_requests_sent',
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='friend_requests',
            field=models.ManyToManyField(blank=True, to='authentication.UserProfile'),
        ),
    ]
