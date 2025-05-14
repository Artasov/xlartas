import os
import platform
import sys

sys.path.insert(0, '/home/c/cs22723/xlartas/public_html')
sys.path.insert(0, '/home/c/cs22723/xlartas/public_html/xlartas')
sys.path.insert(0, '/home/c/cs22723/xlartas/public_html/xlartas/config')
sys.path.insert(0, '/home/c/cs22723/xlartas/myenv/lib/python{0}/site-packages'.format(platform.python_version()[0:3]))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()
