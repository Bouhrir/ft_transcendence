#!/bin/bash

cd /project

python manage.py makemigrations
python manage.py migrate


daphne -b 0.0.0.0 -p 8000 setup.asgi:application
# exec gunicorn setup.wsgi:application --bind 0.0.0.0:8000
# python manage.py runserver 0.0.0.0:8000