from config.base import DEV

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'adjango.middleware.IPAddressMiddleware',
    'logui.middleware.RequestResponseLoggerMiddleware',
    'silk.middleware.SilkyMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # 'csp.middleware.CSPMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'apps.core.middleware.UserPreferredLocale',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.analytics.middleware.VisitLoggingMiddleware'

]
if DEV: MIDDLEWARE.append('adjango.middleware.MediaDomainSubstitutionJSONMiddleware')
