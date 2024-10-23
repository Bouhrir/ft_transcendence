from django.urls import path
from . import views

urlpatterns = [
    # path('', views.main, name='main'),
    path('get-game/', views.get_game, name='get_game'),
]