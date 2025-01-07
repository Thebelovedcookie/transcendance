#!/bin/bash

# Copy files after volume mount
mkdir -p /project/templates/
mkdir -p /project/static/

cp -r /tmp/templates/* /project/templates/
cp -r /tmp/static/* /project/static/
