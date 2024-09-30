from django.urls import  path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from . import views
urlpatterns = [
    path('sign-in/', TokenObtainPairView.as_view()),
    path('sign-up/', views.register_api),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', views.me),
]