from os.path import join

from django.utils.translation import gettext_lazy as _

from config.base import BASE_DIR

# Locale
LANGUAGE_CODE = 'en-us'
USE_I18N = True
USE_TZ = True
LANGUAGES = (
    ('en', _('English')),
    ('ru', _('Russian')),
)
LOCALE_PATHS = (join(BASE_DIR, 'locale'),)
