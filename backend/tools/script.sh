#!/bin/bash

cd /project

python3 manage.py makemigrations
python3 manage.py migrate
# echo "testing from backend"
# daphne -b 0.0.0.0 -p 8000 setup.asgi:application
# daphne -b 0.0.0.0 -p 8000 \
#        --sslkey /etc/ssl/backend.key \
#        --sslcert /etc/ssl/backend.crt \
#        setup.asgi:application

uvicorn setup.asgi:application --host 0.0.0.0 --port 8000 --ssl-keyfile /etc/ssl/backend.key --ssl-certfile /etc/ssl/backend.crt


# python3 manage.py runserver

# exec gunicorn setup.wsgi:application --bind 0.0.0.0:8000
# python manage.py runserver

