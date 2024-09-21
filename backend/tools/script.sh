#!/bin/bash

python manage.py makemigrations
python manage.py migrate

exec daphne -u /tmp/daphne.sock setup.asgi:application