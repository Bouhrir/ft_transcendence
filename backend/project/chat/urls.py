from django import urls
from django.urls import path

from . import views


urlpatterns = [
    path('room/', views.room, name='room'),
]