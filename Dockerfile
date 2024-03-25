# Стадия базовой сборки для уменьшения дублирования команд
FROM python:3.11-alpine as base

COPY . /srv
WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update && apk add --no-cache libpq netcat-openbsd dos2unix supervisor chrony && \
    apk add --virtual .build-deps gcc musl-dev libffi-dev && \
    python -m pip install --upgrade pip && \
    python -m pip install -r /srv/backend/requirements.txt && \
    echo "server pool.ntp.org iburst" >> /etc/chrony/chrony.conf && \
    chmod -R 777 /srv/logs && \
    dos2unix /srv/backend/entrypoint.prod.sh && \
    chmod +x /srv/backend/entrypoint.prod.sh && \
    apk del .build-deps dos2unix

# Конфигурация Supervisor сохраняется в базовом слое
COPY backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Финальная стадия для web
FROM base as web

ENTRYPOINT ["sh", "/srv/backend/entrypoint.prod.sh"]

# Финальная стадия для celery
FROM base as celery

RUN adduser -D celeryuser
USER celeryuser

ENTRYPOINT ["sh", "/srv/backend/entrypoint_celery.sh"]
