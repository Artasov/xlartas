#!/bin/bash

# shellcheck disable=SC2164
cd /srv/backend

echo "Waiting for PostgreSQL to be ready..."
export PGPASSWORD="$DB_PASSWORD"

while ! pg_isready -h "$DB_HOST" -p 5432 -U "$DB_USER" -d "$DB_NAME"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up - continuing"

echo "-----------------------"
echo "Collecting static files"
echo "-----------------------"
python manage.py collectstatic --noinput &&
  echo "------------"
echo "Migrating FAKE..."
echo "------------"
# TODO: УЮРАТЬ
python manage.py migrate --fake
echo "----------------------------------"
echo "Set public policy for media bucket"
echo "----------------------------------"
# python manage.py set_public_policy_media

echo "----------------------------------"
echo "---------Starting Daphne...-------"
echo "----------------------------------"
# Запуск Daphne для обслуживания ASGI-приложения
daphne config.asgi:application --port 8000 --bind 0.0.0.0
