#!/bin/sh
# entrypoint-minio.sh

# Запускаем сервер MinIO
minio server /data --console-address ":9001" &

# Ждем запуска MinIO
sleep 10

# Устанавливаем alias для MinIO
mc alias set myminio http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

# Создаем бакет, если он не существует
mc mb myminio/media --ignore-existing

# Делаем бакет публичным
mc policy set download myminio/media

# Бесконечный цикл, чтобы контейнер не завершался
while true; do
  sleep 60
done
