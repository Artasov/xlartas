#!/bin/bash

docker exec -it web sh -c "
    cd backend && \
    python manage.py pre_init
"
