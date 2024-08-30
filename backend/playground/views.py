from django.shortcuts import render

from django.http import HttpResponse

# Create your views here.
def say_hello(request):
	context = {}
	return render(request, 'index.html', context)