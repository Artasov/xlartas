from django.db import transaction

from APP_referral.models import RefLinking
from APP_shop.funcs import add_license_time
from APP_shop.models import License, Product
from Core.models import User


@transaction.atomic
def sync_ref_program_license_bonus(user_: User):
    standard_count_days = 7
    ref_links_ = RefLinking.objects.filter(inviter__username=user_.username)
    for ref_link_ in ref_links_:
        if ref_link_.given:
            continue
        referral_: User = ref_link_.referral
        count_starts = 0
        if License.objects.filter(user=referral_).exists():
            ref_licenses_ = License.objects.filter(user=referral_)
            for ref_license_ in ref_licenses_:
                count_starts += ref_license_.count_starts
        if count_starts > 20:
            programs = Product.objects.filter(type=Product.ProductType.program)
            for program in programs:
                count_days = standard_count_days * round(ref_links_.filter(given=True).count()/1.5)
                if count_days < standard_count_days:
                    count_days = standard_count_days
                add_license_time(user_=user_, product_name=program.name, days=count_days)
                add_license_time(user_=referral_, product_name=program.name, days=standard_count_days)
            ref_link_.given = True
            ref_link_.save()
