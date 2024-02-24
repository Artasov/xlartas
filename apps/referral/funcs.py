from django.db import transaction

from apps.referral.models import RefLinking
from apps.shop.funcs import add_license_time
from apps.shop.models import Subscription, Product
from apps.Core.models import User


@transaction.atomic
def sync_ref_program_license_bonus(user_: User):
    standard_count_days = 7
    ref_links_ = RefLinking.objects.filter(inviter__username=user_.username)
    for ref_link_ in ref_links_:
        if ref_link_.given:
            continue
        referral_: User = ref_link_.referral
        count_starts = 0
        if Subscription.objects.filter(user=referral_).exists():
            ref_licenses_ = Subscription.objects.filter(user=referral_)
            for ref_license_ in ref_licenses_:
                count_starts += ref_license_.count_starts
        if count_starts > 20:
            programs = Product.objects.filter(type=Product.ProductType.program)
            for program in programs:
                count_days = standard_count_days * round(ref_links_.filter(given=True).count()/1.5)
                if count_days < standard_count_days:
                    count_days = standard_count_days
                add_license_time(user_id=user_.id, product_id=program.id, days=count_days)
                add_license_time(user_id=referral_.id, product_id=program.id, days=standard_count_days)
            ref_link_.given = True
            ref_link_.save()
