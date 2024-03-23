#!/bin/sh
echo "#####################################"
echo "######### Celery Starting... ########"
echo "#####################################"

# shellcheck disable=SC2164
until cd /srv/backend; do
  echo "Waiting for server volume..."
done

celery -A config worker --loglevel=info --task-events --concurrency 1 -E