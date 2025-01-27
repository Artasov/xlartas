# commerce/tests/services/order_service.py
# import pytest
#
# from apps.commerce.factories.order import OrderFactory
# from apps.core.factories.user import UserFactory
#
#
# @pytest.mark.django_db
# @pytest.mark.asyncio
# async def test_order_init():
#     user = await UserFactory.acreate()
#     order = await OrderFactory.acreate(user=user)
#     await order.init(None)
#     assert order.is_inited
#
#
# @pytest.mark.django_db
# @pytest.mark.asyncio
# async def test_order_execute():
#     user = await UserFactory.acreate()
#     order = await OrderFactory.acreate(user=user)
#     await order.execute()
#     assert order.is_executed
#
#
# @pytest.mark.django_db
# @pytest.mark.asyncio
# async def test_order_cancel():
#     user = await UserFactory.acreate()
#     order = await OrderFactory.acreate(user=user)
#     await order.safe_cancel()
#     assert order.is_cancelled
#
#
# @pytest.mark.django_db
# @pytest.mark.asyncio
# async def test_order_sync_with_payment_system():
#     user = await UserFactory.acreate()
#     order = await OrderFactory.acreate(user=user)
#     await order.sync_with_payment_system()
#     assert order.payment is not None
#
#
# @pytest.mark.django_db
# @pytest.mark.asyncio
# async def test_order_cancel_payment():
#     user = await UserFactory.acreate()
#     order = await OrderFactory.acreate(user=user)
#     await order.cancel_payment()
#     assert order.payment.status == "CANCELLED"
