#!/bin/bash
# build_images.sh

REGISTRY="localhost:5000"

echo "--------------------"
echo "Building BASE once..."
echo "-------------------"
docker build -f backend/Dockerfile -t $REGISTRY/ibase:latest .
docker push $REGISTRY/ibase:latest &

# Ждём пуш базового образа перед сборкой остальных
wait

echo "---------------------"
echo "Building and pushing WEB..."
echo "-------------------"
docker build -f backend/DockerfileWeb -t $REGISTRY/iweb:latest .
docker push $REGISTRY/iweb:latest &

echo "--------------------"
echo "Building and pushing CELERY..."
echo "-------------------"
docker build -f backend/DockerfileCelery -t $REGISTRY/icelery:latest .
docker push $REGISTRY/icelery:latest &

echo "--------------------"
echo "Building and pushing BEAT..."
echo "-------------------"
docker build -f backend/DockerfileBeat -t $REGISTRY/ibeat:latest .
docker push $REGISTRY/ibeat:latest &

echo "--------------------"
echo "Building and pushing FLOWER..."
echo "-------------------"
docker build -f backend/DockerfileFlower -t $REGISTRY/iflower:latest .
docker push $REGISTRY/iflower:latest &

echo "--------------------"
echo "Building and pushing NEXT..."
echo "-------------------"
docker build -f frontend/DockerfileNext -t $REGISTRY/ifrontend:latest ./frontend
docker push $REGISTRY/ifrontend:latest &

# Ждём завершения всех фоновых задач
wait


