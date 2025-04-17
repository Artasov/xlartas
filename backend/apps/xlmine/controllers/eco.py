# xlmine/controllers/eco.py
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.models import User
from apps.xlmine.models.user import UserXLMine


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def balance(request):
    """
    Возвращает баланс текущего пользователя.
    """
    user = request.user
    coins = 0
    if hasattr(user, 'userxlmine'):
        coins = float(user.userxlmine.coins)
    return Response({'balance': coins}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def pay(request):
    """
    Передаёт монеты от текущего пользователя к целевому (username).
    Параметры в body:
      {
        "to_username": "someNick",
        "amount": 123.45
      }
    """
    from_user: User = request.user
    to_username = request.data.get('to_username')
    amount = request.data.get('amount')

    if not to_username or not amount:
        return Response({'detail': 'to_username и amount обязательны'}, status=400)

    amount = float(amount)
    if amount <= 0:
        return Response({'detail': 'amount должен быть > 0'}, status=400)

    # Проверяем, что у текущего пользователя достаточно монет
    from_user_xlmine = getattr(from_user, 'userxlmine', None)
    if not from_user_xlmine or from_user_xlmine.coins < amount:
        return Response({'detail': 'Недостаточно монет'}, status=400)

    # Ищем пользователя, кому платим
    to_user = get_object_or_404(User, username=to_username)
    to_user_xlmine, _ = UserXLMine.objects.get_or_create(user=to_user)

    # Снимаем монеты у того, кто платит
    from_user_xlmine.coins -= amount
    from_user_xlmine.save()

    # Добавляем монеты получателю
    to_user_xlmine.coins += amount
    to_user_xlmine.save()

    return Response({
        'detail': f'Успешно переведено {amount} монет игроку {to_user.username}.',
        'from_balance': float(from_user_xlmine.coins),
        'to_balance': float(to_user_xlmine.coins),
    }, status=200)
