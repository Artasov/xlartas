#!/bin/sh
# entrypoint_minio.sh

echo "#####################################"
echo "######### Minio Starting... #########"
echo "#####################################"

# Запускаем сервер MinIO в фоновом режиме
minio server /data --console-address ":9001" &

# Функция для проверки готовности MinIO
check_minio_ready() {
  mc alias set myminio http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
  mc ls myminio
}
# Ожидаем готовности MinIO
until check_minio_ready; do
  echo "Waiting for Minio to be ready..."
  sleep 2
done
echo "--------------"
echo "Minio is ready"
echo "--------------"

echo "-----------------------------------"
echo "Creating static bucket if not exist"
echo "-----------------------------------"
mc mb myminio/static --ignore-existing
mc policy set download myminio/static

echo "----------------------------------"
echo "Creating media bucket if not exist"
echo "----------------------------------"
mc mb myminio/media --ignore-existing
mc policy set download myminio/media

echo "--------------------"
echo "Minio setup complete"
echo "--------------------"

# Блокируем скрипт, чтобы контейнер не завершал работу
wait
