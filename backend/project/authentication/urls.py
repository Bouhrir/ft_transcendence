from django.urls import  path
from django.conf import settings
from django.conf.urls.static import static
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
    path('getuser/', views.get_user),
    path('deluser/', views.deluser),
    path('users/', views.user_list_view),
    # setup 2fa 
    path('2fa/setup/', views.setup_2fa),
    path('2fa/verify/', views.verify_2fa),
    path('2fa/disable/', views.disable_2fa),
    path('2fa/status/', views.get_2fa_status),
    
    path('logout/', views.logout_view),
    
    #intra login
    path('intra/', views.LoginIntra),
    path('callback/', views.callback),

    #edit profile
    path('update_profile/', views.update_profile),


    path('', views.welcome),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)