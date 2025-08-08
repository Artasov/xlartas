#!/bin/sh
echo "#####################################"
echo "######### Flower Starting... ########"
echo "#####################################"
# shellcheck disable=SC2164
until cd /srv/backend; do
  echo "Waiting for server volume..."
done
celery -A config flower --loglevel=warning --url-prefix=flower --basic_auth="${FLOWER_USER}":"${FLOWER_PASSWORD}"
