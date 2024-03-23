#!/bin/sh
echo "#####################################"
echo "######## Start DAPHNE & BEAT ########"
echo "#####################################"


# shellcheck disable=SC2164
cd /srv/backend
supervisord -c /etc/supervisor/conf.d/supervisord.conf
