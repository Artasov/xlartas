FROM python:3.12-alpine AS base

WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Сначала копируем только манифесты зависимостей, чтобы кэшировать установку
COPY ./backend/pyproject.toml ./backend/poetry.lock* /srv/backend/

RUN apk update && \
    apk add --no-cache dos2unix libpq postgresql-dev netcat-openbsd chrony postgresql-client gcc python3-dev musl-dev linux-headers && \
    python -m pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false && \
    cd /srv/backend && poetry install --no-root && \
    echo "server pool.ntp.org iburst" >> /etc/chrony/chrony.conf

# Теперь копируем остальной код проекта и entrypoint-скрипты
COPY ./backend /srv/backend
COPY ./backend/entrypoint.sh ./backend/entrypoint_celery.sh ./backend/entrypoint_beat.sh ./backend/entrypoint_flower.sh /srv/

RUN dos2unix /srv/entrypoint.sh && chmod +x /srv/entrypoint.sh && \
    dos2unix /srv/entrypoint_celery.sh && chmod +x /srv/entrypoint_celery.sh && \
    dos2unix /srv/entrypoint_beat.sh && chmod +x /srv/entrypoint_beat.sh && \
    dos2unix /srv/entrypoint_flower.sh && chmod +x /srv/entrypoint_flower.sh && \
    mkdir -p /srv/data/cache/ /srv/data/temp/ /srv/data/rabbitmq/ /srv/data/sonarqube/ /srv/data/sonarqube/data/ /srv/data/sonarqube/extensions/ /srv/data/sonarqube/logs/ /srv/backend/logs/ /srv/static/ /srv/media/ && \
    addgroup -g 1001 app && adduser -D -G app -u 1001 app && \
    chown -R app:app /srv

USER app

#############
# PROJECT  #
#############
FROM base AS project
ENTRYPOINT ["sh", "/srv/entrypoint.sh"]

#############
# CELERY   #
#############
FROM base AS celery
ENTRYPOINT ["sh", "/srv/entrypoint_celery.sh"]

#############
# BEAT     #
#############
FROM base AS beat
ENTRYPOINT ["sh", "/srv/entrypoint_beat.sh"]

#############
# FLOWER   #
#############
FROM base AS flower
ENTRYPOINT ["sh", "/srv/entrypoint_flower.sh"]


