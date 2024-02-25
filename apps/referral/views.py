from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from apps.referral.funcs import sync_ref_program_license_bonus
from apps.referral.models import RefLinking
from apps.shop.models import Subscription
from apps.Core.error_messages import REF_CODE_NOT_SPECIFIED, INVITER_ALREADY_SETTED, REF_CODE_SELF_USAGE, REF_CODE_DOES_NOT_EXIST
from apps.Core.models import User
from apps.Core.services.services import render_invalid


@login_required(redirect_field_name=None, login_url='signin')
def referrals_list(request):
    user_ = User.objects.get(username=request.user.username)
    sync_ref_program_license_bonus(user_=user_)
    ref_links_ = RefLinking.objects.filter(inviter__username=request.user.username)
    referrals_info: list = []
    for ref_link_ in ref_links_:
        referral_ = ref_link_.referral
        referral_info: dict = {'username': referral_.username}
        count_starts = 0
        if Subscription.objects.filter(user=referral_).exists():
            ref_licenses_ = Subscription.objects.filter(user=referral_)
            for ref_license_ in ref_licenses_:
                count_starts += ref_license_.count_starts
        referral_info['count_starts'] = count_starts
        referral_info['bonus'] = ref_link_.given
        referrals_info.append(referral_info)

    return render(request, 'referral/list.html', {
        'referrals_info': referrals_info
    })


@login_required(login_url='signup')
def set_my_inviter(request, referral_code: str = None):
    if referral_code is None:
        return render_invalid(request, REF_CODE_NOT_SPECIFIED, 'profile')
    if not User.objects.filter(referral_code=referral_code).exists():
        return render_invalid(
            request,
            REF_CODE_DOES_NOT_EXIST,
            'profile')
    if RefLinking.objects.filter(referral__username=request.user.username).exists():
        return render_invalid(request, INVITER_ALREADY_SETTED, 'profile')
    user_ = User.objects.get(username=request.user.username)
    if referral_code == user_.referral_code:
        return render_invalid(request, REF_CODE_SELF_USAGE, 'profile')
    RefLinking.objects.create(inviter=User.objects.get(referral_code=referral_code),
                              referral=user_)
    return redirect('profile')


def referral_program_info(request):
    return render(request, 'referral/info.html')
