from django import urls
from django.urls import path
from . import views


urlpatterns = [
    path('send-invitation/', views.send_invitation, name='send_invitation'),
    path('accept-invitation/', views.accept_invitation, name='accept_invitation'),
    path('delete-invitations/', views.delete_invitations, name='delete_invitations'),
    path('room/', views.room, name='room'),
]