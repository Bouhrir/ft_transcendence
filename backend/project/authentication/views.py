







from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import  Token
from rest_framework import status
from .serializers import UserSerializer

@api_view(['POST'])
def register_api(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            user = User.objects.get(**serializer.data)
            token = Token.objects.create(user=user)
            return Response({'token': token.key , "user": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)




# from rest_framework.response  import Response
# from rest_framework.decorators  import api_view
# from django.contrib.auth.models import User
# from rest_framework import status
# from django.shortcuts import render
# from django.contrib.auth import login , authenticate
# from django.http import HttpResponse
# from rest_framework_simplejwt.tokens import RefreshToken




# def welcome(request):
#     return render(request,'hello.html')




# def user_list_view(request):
#     users = User.objects.all()  # Fetch all registered users
#     return render(request, 'user_list.html', {'users': users})
# # # Create your views here.



# @api_view(['DELETE'])
# def deluser(request):
#     username = request.data.get('username')

#     if not username:
#         return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         user = User.objects.get(username=username)
#         user.delete()
#         return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
#     except User.DoesNotExist:
#         return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

# @api_view(['POST'])
# def signup(request):
#     username = request.data.get('username')
#     password = request.data.get('password')
#     email = request.data.get('email')

#     if not username or not password or not email:
#         return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

#     if User.objects.filter(username=username).exists():
#         return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

#     user = User.objects.create_user(username=username, email=email, password=password)

#     return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


# @api_view(['POST'])
# def signin(request):
#     username = request.data.get('username')
#     password = request.data.get('password')

#     if not username or not password:
#         return Response({"error":"Both username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

#     user = authenticate(request, username=username, password=password)

#     if user is not None:
#         login(request, user)
#         refresh = RefreshToken.for_user(user)
#         response = Response({
#             "message": "User logged in successfully",
#             "access":str(refresh.access_token),
#         }, status=status.HTTP_200_OK)
#         response.set_cookie(key='refresh', value=str(refresh), httponly=True)
#         return response
#     else:
#         return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)