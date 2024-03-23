FROM python:3.11-alpine as base

COPY . /srv
WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update && apk add --no-cache libpq-dev netcat-openbsd dos2unix supervisor chrony
RUN python -m pip install --upgrade pip
RUN python -m pip install -r /srv/backend/requirements.txt

RUN echo "server pool.ntp.org iburst" >> /etc/chrony/chrony.conf
RUN apk add --no-cache chrony
RUN chmod -R 777 /srv/logs

RUN dos2unix /srv/backend/entrypoint.prod.sh && \
    apk del dos2unix

RUN dos2unix /srv/backend/entrypoint.prod.sh
RUN apk del dos2unix
RUN chmod +x /srv/backend/entrypoint.prod.sh

# Конфигурация Supervisor
COPY backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Пользователь для celery
RUN adduser -D celeryuser


FROM base as preconf
ENTRYPOINT ["sh", "/srv/backend/entrypoint.prod.sh"]