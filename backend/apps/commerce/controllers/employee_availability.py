# commerce/controllers/employee_availability.py
from adjango.aserializers import SerializerErrors
from adrf.viewsets import ViewSet
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from apps.commerce.models import EmployeeAvailabilityInterval
from apps.commerce.serializers.availability_interval import AvailabilityIntervalSerializer


class EmployeeAvailabilityViewSet(ViewSet):
    permission_classes = (IsAdminUser,)

    @staticmethod
    async def list(request):
        intervals = await EmployeeAvailabilityInterval.objects.afilter(user=request.user)
        serializer = AvailabilityIntervalSerializer(intervals, many=True)
        return Response(await serializer.adata)

    @staticmethod
    async def create(request):
        data = request.data
        data['user'] = request.user.id
        start = data.get('start')
        end = data.get('end')
        overlapping_intervals = await EmployeeAvailabilityInterval.objects.afilter(
            user=request.user,
            start__lt=end,
            end__gt=start
        )

        if overlapping_intervals:
            return Response({"detail": "Interval overlaps with existing interval"}, status=400)

        serializer = AvailabilityIntervalSerializer(data=data)
        if await serializer.ais_valid():
            await serializer.asave()
            return Response(await serializer.adata, 200)
        raise SerializerErrors(serializer.errors)

    @staticmethod
    async def update(request, pk=None):
        interval = await EmployeeAvailabilityInterval.objects.agetorn(pk=pk, user=request.user)
        if not interval:
            return Response({"detail": "Interval not found"}, status=404)

        data = request.data
        serializer = AvailabilityIntervalSerializer(interval, data=data, partial=True)
        if await serializer.ais_valid():
            await serializer.asave()
            return Response(await serializer.adata, 200)
        return Response(serializer.errors, status=400)

    @staticmethod
    async def destroy(request, pk=None):
        interval = await EmployeeAvailabilityInterval.objects.agetorn(pk=pk, user=request.user)
        if not interval: return Response({"detail": "Interval not found"}, status=404)
        await interval.adelete()
        return Response(status=204)
