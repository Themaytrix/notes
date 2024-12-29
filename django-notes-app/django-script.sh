#!/bin/bash

python3 manage.py collectstatic --noinput

python3 manage.py makemigrations --no-input

python3 manage.py migrate

# rungunicorn
gunicorn --bind 0.0.0.0:8000 noteapp.wsgi:application