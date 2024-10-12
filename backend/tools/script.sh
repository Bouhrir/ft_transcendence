#!/bin/bash

cd /project

python3 manage.py makemigrations
python3 manage.py migrate
# echo "testing from backend"
daphne -b 0.0.0.0 -p 8000 setup.asgi:application
# python3 manage.py runserver
