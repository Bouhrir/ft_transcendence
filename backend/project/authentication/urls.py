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


    path('search/', views.search_users),
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

    #add friend
    path('add_friend/', views.send_friend_request),
    path('get_friends_request/', views.get_friend_requests),
    path('accept_friend/', views.accept_friend_request),
    path('pending/', views.pending),
    path('check_friend/', views.check_friend),
    path('get_friends_list/', views.get_friends_list),
    path('block/', views.block),
    path('set_online/', views.set_online),
    path('check_online/', views.check_online),
    path('offline/', views.offline),
    #get game finished
    path('get_game_status/', views.get_game_status),
    path('get_user_games/', views.get_user_games),


    path('', views.welcome),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)