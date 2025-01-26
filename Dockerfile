FROM python:3.12-alpine AS base

COPY . /srv
WORKDIR /srv

RUN rm -rf /srv/frontend/node_modules /srv/**/__pycache__ /srv/**/*.pyc

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update && \
    apk add --no-cache dos2unix libpq-dev netcat-openbsd chrony postgresql-client gcc python3-dev musl-dev linux-headers && \
    python -m pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false && \
    cd /srv/backend && \
    poetry install --no-root && \
    dos2unix /srv/entrypoint.sh && \
    chmod +x /srv/entrypoint.sh && \
    dos2unix /srv/entrypoint_celery.sh && \
    chmod +x /srv/entrypoint_celery.sh && \
    dos2unix /srv/entrypoint_flower.sh && \
    chmod +x /srv/entrypoint_flower.sh && \
    mkdir -p /srv/data/cache/ /srv/data/temp/ /srv/data/rabbitmq/ /srv/backend/logs/ /srv/static/ /srv/media/ && \
    chmod -R 777 /srv/data/cache/ /srv/data/temp/ /srv/data/rabbitmq/ /srv/backend/logs/ /srv/static/ /srv/media/ && \
    echo "server pool.ntp.org iburst" >> /etc/chrony/chrony.conf

#############
# PROJECT #
#############
FROM base AS project
ENTRYPOINT ["sh", "/srv/entrypoint.sh"]

#############
# CELERY #
#############
FROM base AS celery
ENTRYPOINT ["sh", "/srv/entrypoint_celery.sh"]

#############
# BEAT #
#############
FROM base AS beat
ENTRYPOINT ["sh", "/srv/entrypoint_beat.sh"]

#############
# Flower #
#############
FROM base AS flower
ENTRYPOINT ["sh", "/srv/entrypoint_flower.sh"]
