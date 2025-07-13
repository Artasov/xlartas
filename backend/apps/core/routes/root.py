# core/routes/root.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include
from django.urls import path
from logui.conf import LOGUI_URL_PREFIX

from apps.core.controllers.health import health, change_user_id, clear_redis, run_collectstatic, run_init_test_db, \
    invalidate_cachalot_cache, backend_config

urlpatterns = [
    # Base
    path('health/', health),
    path('xladmin/analytics/', include('apps.analytics.routes.graphics', namespace='analytics')),
    path('xladmin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # API
    path('change_user_id/<int:new_id>/', change_user_id),
    path('clear_redis/', clear_redis, name='clear_redis'),
    path('clear_redis/<str:key>/', clear_redis, name='clear_redis'),
    path('collectstatic/', run_collectstatic),
    path('run_init_test_db/', run_init_test_db),
    path('invalidate_cachalot_cache/', invalidate_cachalot_cache),
    path('api/v1/backend/config/', backend_config),
    path('api/v1/', include('apps.core.routes.api')),
    path('api/v1/', include('apps.social_oauth.routes.api')),
    path('api/v1/', include('apps.theme.routes.api')),
    path('api/v1/', include('apps.chat.routes.api')),
    path('api/v1/', include('apps.commerce.routes.api')),
    path('api/v1/', include('apps.company.routes.api')),
    path('api/v1/', include('apps.xl_dashboard.routes.api')),
    path('api/v1/', include('apps.software.routes.api')),
    path('api/v1/', include('apps.software.legacy.desktop_software_urls')),
    path('api/v1/', include('apps.filehost.routes.api')),
    path('api/v1/', include('apps.converter.routes.api')),
    path('api/v1/xlmine/', include('apps.xlmine.routes.api')),
    path('api/v1/confirmation-code/', include('apps.confirmation.routes.api')),

    # TBank
    path('tbank/', include('apps.commerce.routes.tbank')),

    # Cloud Payments
    path('cloudpayments/', include('apps.cloudpayments.routes')),
    # FreeKassa
    path('freekassa/', include('apps.freekassa.routes')),
    path('ckassa/', include('apps.ckassa.routes')),

    # Other
    path('silk/', include('silk.urls', namespace='silk')),
    path('endpoints/', include('endpoints.urls')),
    path(LOGUI_URL_PREFIX, include('logui.routes.views')),
    path(settings.REDISUI_URL_PREFIX, include('apps.redisui.routes.views')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.append(path('', include('apps.seordj.routes')))
