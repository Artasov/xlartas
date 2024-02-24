import hashlib

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render


def payment_form(request):
    merchant_id = settings.FK_MERCHANT_ID
    secret_word = settings.FK_SECRET_WORD1
    order_id = '154'
    order_amount = '100.11'
    currency = 'RUB'
    sign = hashlib.md5(f'{merchant_id}:{order_amount}:{secret_word}:{currency}:{order_id}'.encode()).hexdigest()

    user_ = request.user

    context = {
        'merchant_id': merchant_id,
        'order_amount': order_amount,
        'order_id': order_id,
        'currency': currency,
        'sign': sign,
        'user_id': user_.id,
    }

    return render(request, 'freekassa/payment_form.html', context)

def payment_notification(request):
    merchant_id = settings.FK_MERCHANT_ID
    merchant_secret = settings.FK_SECRET_WORD2

    def get_ip():
        if 'HTTP_X_REAL_IP' in request.META:
            return request.META.get('HTTP_X_REAL_IP')
        return request.META.get('REMOTE_ADDR')

    allowed_ips = ['168.119.157.136', '168.119.60.227', '138.201.88.124', '178.154.197.79']
    if get_ip() not in allowed_ips:
        return HttpResponse('hacking attempt!')

    sign = hashlib.md5(f"{merchant_id}:{request.POST.get('AMOUNT')}:{merchant_secret}:{request.POST.get('MERCHANT_ORDER_ID')}".encode()).hexdigest()

    if sign != request.POST.get('SIGN'):
        return HttpResponse('wrong sign')

    # Дополнительные проверки на сумму платежа и статус заказа могут быть добавлены здесь

    # Платеж успешно обработан, выполняйте необходимые операции

    return HttpResponse('YES')