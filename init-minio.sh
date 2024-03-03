#!/bin/sh

# Создаем бакет `media`, если он не существует
mc alias set myminio http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
mc mb myminio/media --ignore-existing

# Устанавливаем политику бакета на публичный доступ
mc policy set download myminio/media