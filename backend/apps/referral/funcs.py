from django.db import transaction

from apps.referral.models import RefLinking
from apps.shop.funcs import add_license_time
from apps.shop.models import UserSoftwareSubscription, SoftwareProduct
from apps.Core.models import User


@transaction.atomic
def sync_ref_program_license_bonus(user_: User):
    standard_count_days = 7
    ref_links_ = RefLinking.objects.filter(inviter__username=user_.username)
    for ref_link_ in ref_links_:
        if ref_link_.given:
            continue
        referral_: User = ref_link_.referral
        starts = 0
        if UserSoftwareSubscription.objects.filter(user=referral_).exists():
            ref_licenses_ = UserSoftwareSubscription.objects.filter(user=referral_)
            for ref_license_ in ref_licenses_:
                starts += ref_license_.starts
        if starts > 20:
            programs = SoftwareProduct.objects.filter(type=SoftwareProduct.ProductType.PROGRAM)
            for program in programs:
                count_days = standard_count_days * round(ref_links_.filter(given=True).count()/1.5)
                if count_days < standard_count_days:
                    count_days = standard_count_days
                add_license_time(user_id=user_.id, product_id=program.id, days=count_days)
                add_license_time(user_id=referral_.id, product_id=program.id, days=standard_count_days)
            ref_link_.given = True
            ref_link_.save()
