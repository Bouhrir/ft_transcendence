# Generated by Django 3.2.7 on 2024-10-21 11:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('remote', '0006_game_room_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='type',
            field=models.CharField(default='game', max_length=30),
        ),
    ]