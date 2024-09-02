from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def login(request):
    if request.method == 'POST':
        print(request.POST)
    elif request.method == 'GET':
        print(request.GET)
    else:
        print('Request method not supported')
    return HttpResponse('Hello, world!')