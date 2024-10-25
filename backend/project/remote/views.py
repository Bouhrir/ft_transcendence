from django.shortcuts import render
import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status
from .models import Game
from django.db.models import Q


