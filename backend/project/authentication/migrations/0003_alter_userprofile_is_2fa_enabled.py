# Generated by Django 3.2.7 on 2024-10-10 10:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_userprofile_is_2fa_enabled'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='is_2fa_enabled',
            field=models.BooleanField(default=False),
        ),
    ]