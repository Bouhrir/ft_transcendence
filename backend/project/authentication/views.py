from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import  Token
from rest_framework import status
from .serializers import UserSerializer
from .models import UserProfile
import pyotp
import qrcode
from io import BytesIO
import base64
from django.contrib.auth.hashers import check_password


@api_view(['POST'])
def register_api(request):
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(**serializer.data) 
        return Response({
            "message": "User registered successfully",
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# setup 2fa for the user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_2fa_status(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)
    print(profile.is_2fa_enabled)
    return Response({
        'is_2fa_enabled': profile.is_2fa_enabled
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)

    if not profile.is_2fa_enabled:
        totp_secret = pyotp.random_base32()
        profile.totp_secret = totp_secret
        profile.is_2fa_enabled = True
        profile.save()
    else:
        totp_secret = profile.totp_secret

    totp = pyotp.TOTP(totp_secret)
    otp_auth_url = totp.provisioning_uri(name=user.email, issuer_name="setup")

    # Generate QR code for the TOTP secret
    qr = qrcode.make(otp_auth_url)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_code_image = base64.b64encode(buffer.getvalue()).decode()

    return Response({
        'qr_code_image': f"data:image/png;base64,{qr_code_image}",
        'totp_secret': totp_secret,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    otp = request.data.get('verification_code')
    user = request.user
    profile = UserProfile.objects.get(user=user)

    if not profile.is_2fa_enabled:
        return Response({"error": "2FA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)

    totp = pyotp.TOTP(profile.totp_secret)

    if totp.verify(otp):
        return Response({"message": "2FA verified successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)

    if not profile.is_2fa_enabled:
        return Response({"error": "2FA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)
    else :
        profile.totp_secret = ""
        profile.is_2fa_enabled = False
        profile.save()
    return Response({"message": "2FA has been disabled successfully."}, status=status.HTTP_200_OK)
# modify the user profile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile = UserProfile.objects.get(user=user).user
    data = request.data

    if 'password' in data:
        current_password = data['password']
        if not check_password(current_password, profile.password):
            return Response({"error": "Invalid current password"}, status=status.HTTP_400_BAD_REQUEST)
    if 'first_name' in data:
        profile.first_name = data['first_name']
    if 'last_name' in data:
        profile.last_name = data['last_name']
    if 'username' in data:
        profile.last_name = data['username']
    if 'email' in data:
        profile.email = data['email']

    profile.save()

    return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        "id":user.id,
        "username":user.username,
        "email":user.email,
        "first_name":user.first_name,
        "last_name":user.last_name,
    })

def welcome(request):
    return render(request,'hello.html')

def user_list_view(request):
    users = User.objects.all()  # Fetch all registered users
    return render(request, 'user_list.html', {'users': users})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deluser(request):
    username = request.user
    
    if not username:
        return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

# from rest_framework.response  import Response
# from rest_framework.decorators  import api_view
# from django.contrib.auth.models import User
# from rest_framework import status
# from django.shortcuts import render
# from django.contrib.auth import login , authenticate
# from django.http import HttpResponse
# from rest_framework_simplejwt.tokens import RefreshToken







# # # Create your views here.




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