# build_up.sh
#!/bin/bash
echo "-----------------------"
echo "Building docker-compose..."
echo "-----------------------"
docker-compose build --parallel
echo "------------------"
echo "Build successfully, starting..."
echo "------------------"
docker-compose up -d
echo "---------------------------------"
echo "Deployment completed successfully"
echo "---------------------------------"
docker-compose logs -f
