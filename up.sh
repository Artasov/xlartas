#!/bin/bash
echo "------------------------------------------"
echo "Starting containers with Docker Compose..."
echo "------------------------------------------"
docker-compose --env-file ./backend/.env -f docker-compose.yml up
