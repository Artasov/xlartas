#!/bin/sh
echo "#####################################"
echo "######### BEAT Starting... ########"
echo "#####################################"

# shellcheck disable=SC2164
until cd /srv/backend; do
  echo "Waiting for server volume..."
done

python manage.py celerybeat


