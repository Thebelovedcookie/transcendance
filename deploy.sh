#! /bin/bash

# Sync frontend files to data directory
rsync -av --delete srcs/frontend/ data/frontend/ --dry-run
echo "Are you sure? (y/n)"
read -s -n 1 answer
if [ "$answer" = "y" ]; then
    rsync -av --delete srcs/frontend/ data/frontend/
fi
