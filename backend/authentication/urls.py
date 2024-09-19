from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('sign-in/', views.signin),
    path('sign-up/', views.signup),
    path('', views.welcome),
    path('users/', views.user_list_view, name='user-list'),
    path('deluser/', views.deluser, name='delete-users'),
    # Token obtain and refresh endpoints
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

