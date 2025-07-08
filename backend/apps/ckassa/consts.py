# ckassa/consts.py

from ipaddress import ip_network

CKASSA_NOTIFICATION_ALLOWED_URLS = (
    ip_network('178.161.210.54'),
    ip_network('94.138.149.0/24'),
)
