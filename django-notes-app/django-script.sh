#!/bin/bash

# collect static files from staticfiles directory
python3 manage.py collectstatic --noinput

# prepare django application to make migrations
python3 manage.py makemigrations --no-input

# perform migration
python3 manage.py migrate

# run gunicorn server
gunicorn --bind 0.0.0.0:8000 noteapp.wsgi:application