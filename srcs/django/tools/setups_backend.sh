#!/bin/bash
cleanup() {
    echo "Cleaning up..."
    exit 0
}
trap cleanup SIGINT SIGTERM

export PYTHONPATH=${PYTHONPATH}:/project

# python3.11 /project/manage.py runserver 0.0.0.0:8000 &
daphne backend_project.asgi:application -b 0.0.0.0 -p 8000 &
DJANGO_PID=$!

wait ${DJANGO_PID}
