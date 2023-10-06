from django.contrib.auth.decorators import login_required
from django.forms import modelform_factory
from django.shortcuts import render, redirect
from APP_referral.models import RefLinking
from APP_shop.models import Product, Subscription, Order
from APP_shop.services.qiwi import create_payment_and_order
from Core.forms import DonateFrom
from Core.models import *
from Core.services.services import base_view


@base_view
def main(request):
    return render(request, 'Core/main.html', {
        'products': Product.objects.filter(available=True)
    })


@base_view
@login_required(redirect_field_name=None, login_url='signin')
def profile(request):
    user_ = User.objects.get(username=request.user.username)
    user_subs = Subscription.objects.filter(user=user_)
    least_days = {}
    context = {}
    for sub_ in user_subs:
        remained = int((sub_.date_expiration - timezone.now()).total_seconds() / 3600)
        if remained > 9600:
            remained = 'FOREVER'
        elif remained < 1:
            remained = 'None'
        least_days[Product.objects.get(id=sub_.product_id).name] = remained
    if RefLinking.objects.filter(referral__username=user_.username).exists():
        context['inviter_'] = RefLinking.objects.get(referral__username=user_.username).inviter

    context['least_days'] = least_days
    context['domain'] = request.build_absolute_uri('/')[0:-1]
    context['user_'] = user_
    form = modelform_factory(User, fields=('username',))(request.POST or None, instance=user_)
    if form.is_valid():
        form.save()
    context['form'] = form
    return render(request, 'Core/profile.html', context)


@base_view
@login_required
def donate(request):
    form = DonateFrom(request.POST or None)
    if form.is_valid():
        order_ = create_payment_and_order(
            user_id=request.user.id,
            amount=form.cleaned_data.get('amount'),
            order_type=Order.OrderType.DONATE,
            expired_minutes=10,
            comment=f'User deposit: {request.user.username}\n')
        return redirect(order_.pay_link)
    print(1)
    return render(request, 'Core/donate.html', {'form': form})
