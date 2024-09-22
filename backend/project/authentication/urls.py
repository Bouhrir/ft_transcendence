from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView , TokenObtainPairView

urlpatterns = [
    path('sign-in/', views.signin),
    path('sign-up/', views.signup),
    path('', views.welcome),
    path('users/', views.user_list_view, name='user-list'),
    path('deluser/', views.deluser, name='delete-users'),
    
    # Token obtain and refresh endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_create'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

