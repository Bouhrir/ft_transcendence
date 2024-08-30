from django import urls

from . import views

urlpatterns = [
	urls.path('', views.say_hello),
]
