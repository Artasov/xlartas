#!/bin/sh
/usr/sbin/chronyd

echo "chronyc exec"
chronyc tracking

# shellcheck disable=SC2164
cd /srv/backend
echo "Collecting static files"
python manage.py collectstatic --noinput &&
  echo "Migrating"
python manage.py migrate
echo "Set public policy for media bucket"
python manage.py set_public_policy_media

supervisord -c /etc/supervisor/conf.d/supervisord.conf
#echo "Start DAPHNE & BEAT"

# Start beat
#python manage.py startbeat &
# Start server
#daphne config.asgi:application --port 8000 --bind 0.0.0.0
#gunicorn config.wsgi:application --workers 1 --bind 0.0.0.0:8000 --timeout 60 --max-requests 1000
#uvicorn config.asgi:application --host 0.0.0.0 --port 8000
