#!/bin/bash
cleanup() {
    echo "Cleaning up..."
    exit 0
}
trap cleanup SIGINT SIGTERM

python3.11 /project/manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

wait ${DJANGO_PID}
