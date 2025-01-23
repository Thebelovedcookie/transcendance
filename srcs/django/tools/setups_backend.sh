#!/bin/bash
cleanup() {
    echo "Cleaning up..."
    exit 0
}
trap cleanup SIGINT SIGTERM

export PYTHONPATH=${PYTHONPATH}:/project

export DJANGO_SUPERUSER_PASSWORD=12qwaszx
python3.11 manage.py makemigrations
python3.11 manage.py migrate
python3.11 manage.py createsuperuser --noinput --username admin --email admin@admin.com

# python3.11 /project/manage.py runserver 0.0.0.0:8000 &
daphne backend_project.asgi:application -b 0.0.0.0 -p 8000 &
DJANGO_PID=$!

wait ${DJANGO_PID}
