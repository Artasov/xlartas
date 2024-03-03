#!/bin/sh
# entrypoint-minio.sh

# Запускаем сервер MinIO
echo "#####################################"
echo "######### Minio Starting... ########"
echo "#####################################"
minio server /data --console-address ":9001" &

echo "wait minio starting..."
sleep 10

echo "set alias"
mc alias set myminio http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

# Создаем бакет, если он не существует
echo "Create media bucket if not exist"
mc mb myminio/media --ignore-existing

echo "Set public policy for media bucket"
mc policy set download myminio/media

# Бесконечный цикл, чтобы контейнер не завершался
echo "Minio start successfully"
while true; do
  sleep 60
done
