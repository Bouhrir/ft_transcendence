from django import urls

from . import views 

urlpatterns = [
    urls.path('login/', views.login),
    urls.path('', views.login),
]