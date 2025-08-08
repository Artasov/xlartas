#!/bin/bash
# build_images.sh

REGISTRY="localhost:5000"

#echo "--------------------"
#echo "Building and pushing MINIO..."
#echo "-------------------"
#docker build -f DockerfileMinio -t $REGISTRY/iminio:latest .
#docker push $REGISTRY/iminio:latest &

echo "--------------------"
echo "Building BASE once..."
echo "-------------------"
docker build -f Dockerfile -t $REGISTRY/ibase:latest .
docker push $REGISTRY/ibase:latest &

# Wait for base image push to complete before starting other builds
wait

echo "---------------------"
echo "Building and pushing WEB..."
echo "-------------------"
docker build -f DockerfileWeb -t $REGISTRY/iweb:latest .
docker push $REGISTRY/iweb:latest &

echo "--------------------"
echo "Building and pushing CELERY..."
echo "-------------------"
docker build -f DockerfileCelery -t $REGISTRY/icelery:latest .
docker push $REGISTRY/icelery:latest &

echo "--------------------"
echo "Building and pushing BEAT..."
echo "-------------------"
docker build -f DockerfileBeat -t $REGISTRY/ibeat:latest .
docker push $REGISTRY/ibeat:latest &

echo "--------------------"
echo "Building and pushing FLOWER..."
echo "-------------------"
docker build -f DockerfileFlower -t $REGISTRY/iflower:latest .
docker push $REGISTRY/iflower:latest &

echo "--------------------"
echo "Building and pushing NEXT..."
echo "-------------------"
docker build -f DockerfileNext -t $REGISTRY/ifrontend:latest .
docker push $REGISTRY/ifrontend:latest &

# Wait for all background processes to finish
wait
