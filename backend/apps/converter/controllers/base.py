# converter/controllers/base.py
import logging

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from django.http import FileResponse, HttpResponseNotFound
from django.utils.translation import gettext_lazy as _
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_429_TOO_MANY_REQUESTS

from apps.converter.models import (Conversion, Format)
from apps.converter.serializers import (
    ConversionSerializer, FormatSerializer, ParameterSerializer
)
from apps.converter.services import ConversionService

log = logging.getLogger("global")


@acontroller("List formats")
@api_view(("GET",))
@permission_classes((AllowAny,))
async def formats(_):
    data = [await FormatSerializer(f).adata async for f in Format.objects.all()]
    return Response(data, status=HTTP_200_OK)


@acontroller("Parameters for format")
@api_view(("GET",))
@permission_classes((AllowAny,))
async def parameters(_, format_id: int):
    fmt = await Format.objects.aget(id=format_id)
    data = [await ParameterSerializer(p).adata async for p in fmt.parameters.all()]
    return Response(data, status=HTTP_200_OK)


@acontroller("Conversion variants")
@api_view(("GET",))
@permission_classes((AllowAny,))
async def possible_out_formats(_, format_id: int):
    targets = Format.objects.filter(target_variants__source_id=format_id).distinct()
    data = [await FormatSerializer(fmt).adata async for fmt in targets]
    return Response(data, status=HTTP_200_OK)


@acontroller("Create conversion")
@api_view(("POST",))
@permission_classes((AllowAny,))
async def convert(request):
    file = request.FILES.get("file")
    source_id = request.data.get("source_format")
    target_id = request.data.get("target_format")
    params = request.data.get("params", {})
    output_name = request.data.get("output_name")
    if not all([file, source_id, target_id]):
        return Response({"detail": _("Invalid request")}, status=HTTP_400_BAD_REQUEST)
    source = await Format.objects.aget(id=source_id)
    target = await Format.objects.aget(id=target_id)
    user = request.user if request.user.is_authenticated else None
    ip = request.META.get("REMOTE_ADDR", "")
    try:
        conversion = await ConversionService.create(
            user=user,
            ip=ip,
            input_file=file,
            source_format=source,
            target_format=target,
            params=params,
            output_name=output_name,
        )
    except ValueError as e:
        msg = str(e)
        status = HTTP_400_BAD_REQUEST
        if "Rate limit" in msg:
            status = HTTP_429_TOO_MANY_REQUESTS
        return Response({"detail": msg}, status=status)
    data = await ConversionSerializer(conversion).adata
    remaining = await ConversionService.remaining_attempts(user, ip)
    return Response({"conversion": data, "remaining": remaining}, status=HTTP_201_CREATED)


@acontroller("Conversion status")
@api_view(("GET",))
@permission_classes((AllowAny,))
async def conversion_status(_, conversion_id: int):
    conversion = await Conversion.objects.aget(id=conversion_id)
    return Response(await ConversionSerializer(conversion).adata, status=HTTP_200_OK)


@acontroller("Download converted file")
@api_view(("GET",))
@permission_classes((AllowAny,))
async def download(_, conversion_id: int):
    try:
        conversion = await Conversion.objects.aget(id=conversion_id)
    except Conversion.DoesNotExist:
        return HttpResponseNotFound(_("Conversion not found"))

    if not conversion.is_done or not conversion.output_file:
        return HttpResponseNotFound(_("File not available"))

    response = FileResponse(open(conversion.output_file.path, "rb"), content_type="application/octet-stream")
    filename = conversion.output_name or conversion.output_file.name.split("/")[-1]
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@acontroller("Remaining attempts")
@api_view(("GET",))
@permission_classes((AllowAny,))
async def remaining(request):
    user = request.user if request.user.is_authenticated else None
    ip = request.META.get("REMOTE_ADDR", "")
    rem = await ConversionService.remaining_attempts(user, ip)
    return Response({"remaining": rem}, status=HTTP_200_OK)
