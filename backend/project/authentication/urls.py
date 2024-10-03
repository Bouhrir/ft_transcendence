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
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', views.me),
    path('deluser/', views.deluser),
    path('users/', views.user_list_view),
    path('2fa/setup/', views.setup_2fa),
    path('2fa/verify/', views.verify_2fa),
    path('', views.welcome),
]