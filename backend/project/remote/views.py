from django.shortcuts import render


# Create your views here.
def main(request):
    return render(request, 'remote/index.html')

from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        # print(user)
        if user is not None:
            # print("test")
            login(request, user)
            return redirect('main')  # Replace with your actual game view name
    return render(request, 'remote/login.html')  # Create a simple login template