# Generated by Django 3.2.7 on 2024-10-14 10:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('remote', '0005_remove_game_room_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='room_name',
            field=models.CharField(default='default', max_length=50, unique=True),
        ),
    ]