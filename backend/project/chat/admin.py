from django.contrib import admin
from .models import Message
from .models import Invitation

admin.site.register(Message)
admin.site.register(Invitation)