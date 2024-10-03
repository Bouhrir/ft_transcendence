from django import urls

from . import views


urlpatterns = [
    urls.path('', views.Begin.as_view()),
    # urls.path('', views.hello)
]