# import os
#
# from django.contrib.auth.decorators import login_required
# from django.db import transaction
# from django.http import HttpResponseBadRequest, HttpResponse
# from django.shortcuts import render, redirect, get_object_or_404
#
# from apps.Core.models import User
# from apps.Core.services.services import allowed_only
# from .forms import DepositForm, BuyProductProgramForm
# from .funcs import check_user_payments, execute_software_order, try_apply_promo
# from .models import SoftwareProduct, SoftwareSubscriptionOrder
# from .services.orders_service import get_user_orders
# from .services.product import get_software_product_starts, is_test_period_activated
# from .services.qiwi import create_payment_and_order
#
#
# def catalog(request):
#     return render(request, 'shop/catalog.html', context={
#         'products': SoftwareProduct.objects.order_by('name').reverse(), })
#
#
# @allowed_only(('POST',))
# @login_required
# @transaction.atomic
# def buy_product_program(request):
#     usonSubmit User = request.user
#     license_type = request.POST.get('subscription_variant')
#     product_name = request.POST.get('product_name')
#     recaptcha_response = request.POST.get('g-recaptcha-response')
#
#     product_ = get_object_or_404(SoftwareProduct, name=product_name)
#
#     form = BuyProductProgramForm(data={
#         'user_': user_,
#         'subscription_variant': license_type,
#         'product_': product_,
#         'g-recaptcha-response': recaptcha_response
#     })
#     if form.is_valid():
#         order_ = SoftwareSubscriptionOrder.objects.create(
#             user=user_,
#             amountRub=form.cleaned_data.get('price'),
#             product=product_,
#             license_type=license_type,
#             type=SoftwareSubscriptionOrder.SoftwareOrderType.PRODUCT)
#         execute_software_order(order_)
#         return redirect('profile')
#
#     return render(request, 'shop/product_program.html', {
#         'form': form,
#         'software': product_,
#         'is_test_period_activated': is_test_period_activated(
#             product_id=product_.id, user_id=user_.id),
#         'starts': get_software_product_starts(
#             product_id=product_.id)
#     })
#
#
# @login_required(redirect_field_name=None, login_url='signin')
# @transaction.atomic
# def activate_test_period(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest()
#
#     from .services.product import activate_test_period
#     activate_test_period(request.user.id, request.POST.get('software'))
#     return redirect('profile')
#
#
# @login_required(redirect_field_name=None, login_url='signin')
# def orders(request):
#     user_ = request.user
#     form = DepositForm(request.POST or None, user=user_)
#     if form.is_valid():
#         amount = form.cleaned_data.get('amount')
#         promo = form.cleaned_data.get('promo')
#         amount_with_promo = amount
#         if promo:
#             res = try_apply_promo(promo, request.user, amount)
#             if res == 'redirect_orders':
#                 return redirect('shop:orders')
#             elif res.get('new_price'):
#                 amount_with_promo = res['new_price']
#
#         order_ = create_payment_and_order(
#             user_id=user_.id,
#             amount=amount,
#             amount_with_promo=amount_with_promo,
#             promo_id=promo.id if promo else None,
#             order_type=SoftwareSubscriptionOrder.SoftwareOrderType.BALANCE,
#             expired_minutes=10,
#             comment=f'User deposit: {user_.username}\n')
#
#         return redirect(order_.pay_link)
#
#     return render(request, 'shop/orders.html', {
#         'form': form,
#         'orders': get_user_orders(user_id=user_.id),
#     })
#
#
# @login_required
# def check_payment(request):
#     check_user_payments(request.user)
#     return redirect('shop:orders')
#
#
# def product_program(request, program_name: str):
#     product_ = SoftwareProduct.objects.get(name=program_name)
#     if not product_.is_available:
#         return redirect('shop:catalog')
#
#     return render(request, 'shop/product_program.html', {
#         'software': product_,
#         'is_test_period_activated': is_test_period_activated(
#             user_id=request.user.id, product_id=product_.id),
#         'starts': get_software_product_starts(
#             product_id=product_.id)
#     })
#
#
# def download_program(request, product_id):
#     product = get_object_or_404(SoftwareProduct, id=product_id)
#
#     if product.type != SoftwareProduct.ProductType.PROGRAM or not product.file:
#         return HttpResponse(status=404)
#
#     file_path = product.file.file.path
#     file_content = open(file_path, 'rb').read()
#
#     _, file_extension = os.path.splitext(file_path)
#     if not file_extension:
#         file_extension = '.exe'
#
#     response = HttpResponse(file_content, content_type='application/force-download')
#     response['Content-Disposition'] = f'attachment; filename={product.name} {product.version}{file_extension}'
#     return response
