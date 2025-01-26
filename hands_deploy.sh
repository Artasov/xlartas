#!/bin/bash
echo "------------------------------"
echo "Stopping running containers..."
echo "------------------------------"
# shellcheck disable=SC2046
docker stop $(docker ps -q)
echo "----------"
echo "Pulling..."
echo "----------"
git pull
echo "------------------------"
echo "Pruning Docker system..."
echo "------------------------"
yes | docker system prune -a
echo "-----------------------"
echo "Building docker-compose..."
echo "-----------------------"
docker-compose --env-file ./backend/.env -f docker-compose.yml build --parallel
echo "------------------"
echo "Build successfully, starting..."
echo "------------------"
docker-compose --env-file ./backend/.env -f docker-compose.yml up -d
echo "---------------------------------"
echo "Deployment completed successfully"
echo "---------------------------------"
docker-compose --env-file ./backend/.env -f docker-compose.yml logs -f
