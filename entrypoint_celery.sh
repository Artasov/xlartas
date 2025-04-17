#!/bin/sh
echo "#####################################"
echo "######### Celery Starting... ########"
echo "#####################################"

# shellcheck disable=SC2164
until cd /srv/backend; do
  echo "Waiting for server volume..."
done

python manage.py startworker --pool=solo --loglevel=info -E
#celery -A config worker --loglevel=info --task-events --concurrency 1 -E
