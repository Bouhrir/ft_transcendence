
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status
from .serializers import UserSerializer
import pyotp
import qrcode
from io import BytesIO
import base64
from .models import UserProfile  # Assuming UserProfile model stores the TOTP secret

# Register new users
@api_view(['POST'])
def register_api(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        user_profile = UserProfile.objects.create(user=user)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Set up 2FA by generating a TOTP secret and returning a QR code
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    user = request.user
    profile = user.userprofile

    if not profile.totp_secret:
        totp_secret = pyotp.random_base32()  # Generate a new TOTP secret
        profile.totp_secret = totp_secret
        profile.save()
    else:
        totp_secret = profile.totp_secret

    totp = pyotp.TOTP(totp_secret)
    otp_auth_url = totp.provisioning_uri(name=user.email, issuer_name="YourApp")

    # Generate QR code for the TOTP secret
    qr = qrcode.make(otp_auth_url)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_code_image = base64.b64encode(buffer.getvalue()).decode()

    return Response({
        'qr_code_image': f"data:image/png;base64,{qr_code_image}",
        'totp_secret': totp_secret,
    })

# Verify the OTP entered by the user
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    otp = request.data.get('otp')
    user = request.user
    profile = user.userprofile

    if not profile.totp_secret:
        return Response({"error": "2FA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)

    totp = pyotp.TOTP(profile.totp_secret)

    if totp.verify(otp):
        # OTP verified successfully
        return Response({"message": "2FA verified successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
