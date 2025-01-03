#!/bin/bash


echo -e "Starting Nginx setup..."

if [ ! -d /etc/nginx/ssl ]; then
    echo -e "Creating SSL directory..."
    mkdir -p /etc/nginx/ssl
fi

if [ ! -f /etc/nginx/ssl/inception.key ] || [ ! -f /etc/nginx/ssl/inception.crt ]; then
    echo -e "Generating new SSL certificates..."
    openssl req -x509 -nodes -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/transcendance.key \
        -out /etc/nginx/ssl/transcendance.crt \
        -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42/CN=mmahfoud.42.fr/UID=mmahfoud"
else
    echo -e "SSL certificates already exist."
fi

echo -e "Starting Nginx..."

nginx -g 'daemon off;'