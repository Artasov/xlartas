from django.contrib import admin

from APP_referral.models import RefLinking


@admin.register(RefLinking)
class RefLinkingAdmin(admin.ModelAdmin):
    list_display = ['inviter', 'referral', 'given']
    save_on_top = True
