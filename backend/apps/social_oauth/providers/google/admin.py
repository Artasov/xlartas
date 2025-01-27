# social_oauth/providers/google/admin.py
from django.contrib import admin

from apps.social_oauth.models import GoogleUser


@admin.register(GoogleUser)
class GoogleUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'google_id')
    search_fields = ('user__username', 'google_id')
