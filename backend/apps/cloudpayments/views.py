# apps/cloudpayments/views.py
import json
from pprint import pprint

from django.conf import settings
from django.shortcuts import get_object_or_404, render

from apps.commerce.models import Order


def pay(request, order_id):
    """
    Открывает страницу оплаты CloudPayments для указанного заказа.
    На этой странице сразу же открывается виджет с чеком
    и при успешном платеже закроется и перенаправит клиента
    обратно на страницу заказа.
    """
    order = get_object_or_404(Order, pk=order_id)

    # Сумма в виде float, чтобы точка, а не запятая
    amount = str(order.payment.amount)

    # Формируем чек (CustomerReceipt)
    receipt = {
        "Items": [
            {
                "label": f"Оплата заказа #{order.id}",
                "price": amount,
                "quantity": 1,
                "amount": amount,
                "vat": 0,
                "method": 0,
                "object": 4,  # payment
                "measurementUnit": "шт",
            }
        ],
        "calculationPlace": request.get_host(),
        "taxationSystem": 0,
        "email": order.user.email or "",
        "phone": str(getattr(order.user, "phone", "")),
    }

    ctx = {
        "public_id": settings.CLOUD_PAYMENT_PUBLIC_ID,
        "order_id": str(order.id),
        "amount": amount,
        "currency": order.currency,
        "description": f"Оплата заказа #{order.id}",
        # JSON для вставки в JS
        "receipt_json": json.dumps(receipt),
    }
    response = render(request, "cloudpayments/pay.html", ctx)
    # Отдаём минимальную CSP, чтобы только наш скрипт и widget могли грузиться
    response["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://widget.cloudpayments.ru 'unsafe-inline'; "
        "frame-src https://widget.cloudpayments.ru;"
    )
    return response
