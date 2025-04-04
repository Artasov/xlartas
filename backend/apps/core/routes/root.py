# core/routes/root.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, re_path
from django.urls import path
from django.views.generic import TemplateView
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
    path('api/v1/', include('apps.shop.desktop_software_urls')),
    path('api/v1/xlmine/', include('apps.xlmine.routes.api')),
    path('api/v1/confirmation-code/', include('apps.confirmation.routes.api')),

    # TBank
    path('tbank/', include('apps.commerce.routes.tbank')),

    # Other
    path('silk/', include('silk.urls', namespace='silk')),
    path('endpoints/', include('endpoints.urls')),
    path(LOGUI_URL_PREFIX, include('logui.routes.views')),
    path(settings.REDISUI_URL_PREFIX, include('apps.redisui.routes.views')),

    # path('api/', include(('apps.shop.urls', 'apps.shop'), namespace='shop')),
    # path('api/', include(('apps.confirmation.urls', 'apps.confirmation'), namespace='confirmation')),
    # path('api/surveys/', include(('apps.surveys.urls', 'apps.surveys'), namespace='surveys')),
    # path('api/host/', include(('apps.filehost.urls', 'apps.filehost'), namespace='filehost')),
    # path('pay/', include('apps.tinkoff.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.append(re_path(r'^.*$', TemplateView.as_view(template_name='index.html')))
