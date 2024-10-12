from django import urls
from django.urls import path
from . import views


urlpatterns = [
    path('', views.main, name='main'),
    path('send-invitation/', views.send_invitation, name='send_invitation'),
    path('accept-invitation/', views.accept_invitation, name='accept_invitation'),
    path('delete-invitations/', views.delete_invitations, name='delete_invitations'),
]