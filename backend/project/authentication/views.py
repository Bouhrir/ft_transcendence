from django.shortcuts import render
from django.http import HttpResponseRedirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import status
from .serializers import UserSerializer
from .models import UserProfile
import pyotp
import qrcode
from io import BytesIO
import base64
import string
import secrets
import requests
from django.conf import settings  # Added import for settings

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


# Oauth2.0 users
def generate_random_password(length=12):
    # Define the character set for the password
    characters = string.ascii_letters + string.digits + string.punctuation
    # Generate a random password using the secrets module
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password

def register_42(user_data):
    if not user_data:
        return Response({'error': 'No user data provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the user already exists based on the 'login' (username)
    try:
        user = User.objects.get(username=user_data['login'])
        # User exists, retrieve or create a token for them
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'logged in successfully',
            'token': token.key,
        })
    except User.DoesNotExist:
        # User doesn't exist, register a new user
        serializer = UserSerializer(data={
            'username': user_data['login'],
            'email': user_data['email'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'image': user_data['image']['versions']['large'],
            'password': generate_random_password(),
        })
        print(user_data['image']['versions']['large'])
        if serializer.is_valid():
            user = serializer.save()  # Save the new user
            token = Token.objects.create(user=user)  # Create a token for the new user
            return Response({
                'message': 'User created successfully',
                'token': token.key,
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def LoginIntra(request):
    # Redirect the user to the 42 API for authentication
    auth_url = (
        'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-c2d8175ca10c11077651ebdd5fec416379865ae11fbf864cb4e5cc19093221c7&redirect_uri=http%3A%2F%2Flocalhost%3A81%2Fauth%2Fcallback%2F&response_type=code'
    )
    return HttpResponseRedirect(auth_url)

@api_view(['GET'])
def callback(request):
    # Get the authorization code from the query parameters
    code = request.GET.get('code')  # Corrected from request.get to request.GET.get

    if not code:
        return Response({'error': 'No code provided'}, status=400)

    # Step to exchange the authorization code for an access token
    token_url = 'https://api.intra.42.fr/oauth/token'
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': settings.SOCIALACCOUNT_PROVIDERS['intra']['APP']['client_id'],  # Your app's client ID
        'client_secret': settings.SOCIALACCOUNT_PROVIDERS['intra']['APP']['secret'],
        'redirect_uri': settings.SOCIALACCOUNT_PROVIDERS['intra']['APP']['redirect_uris'],  # You may need to define this in your settings
        'code': code,
    }

    # Send a POST request to exchange the code for a token
    token_response = requests.post(token_url, data=token_data)

    if token_response.status_code != 200:
        return Response({'error': 'Failed to obtain access token'}, status=token_response.status_code)

    token_json = token_response.json()
    access_token = token_json.get('access_token')

    if access_token:
        # You can now use the access token to fetch user data or perform actions
        user_info_url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {access_token}'}
        user_info_response = requests.get(user_info_url, headers=headers)

        if user_info_response.status_code == 200:
            user_data = user_info_response.json()
            return register_42(user_data)
    return Response({'error': 'Failed to fetch user data'}, status=400)


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