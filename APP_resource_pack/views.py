from typing import List

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.db.models import Count
from django.http import FileResponse
from django.shortcuts import render, get_object_or_404
from django.template.defaultfilters import slugify
from django.utils.decorators import decorator_from_middleware
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from transliterate import translit

from Core.error_messages import FILE_TOO_BIG, IMAGE_TOO_BIG, OBJ_WITH_THIS_NAME_EXISTS, \
    SOMETHING_WRONG, NOT_ALL_FIELDS_FILLED_OR_INCORRECT, NOT_FOUND_404
from Core.middleware import reCaptchaMiddleware
from Core.models import User, File
from Core.services.services import render_invalid
from .models import ResourcePack, ResourcePackImage
from .serializers import ResourcePackSerializer


@api_view(['PUT'])
def vote(request):
    rp_id = request.data.get('rp_id')
    user_id = request.session.get('_auth_user_id')

    if not rp_id or not user_id:
        return Response({'error': 'rp_id or user_id not provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        rp_ = ResourcePack.objects.get(id=rp_id)
        user_ = User.objects.get(id=user_id)
    except ResourcePack.DoesNotExist:
        return Response({'error': 'Resource pack not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    is_user_in_rp_likes = user_ in rp_.likes_by.all()

    if is_user_in_rp_likes:
        rp_.likes_by.remove(user_)
        rp_.likes -= 1
    else:
        rp_.likes_by.add(user_)
        rp_.likes += 1
    rp_.save()

    return Response({'like': not is_user_in_rp_likes}, status=status.HTTP_200_OK)


def download(request, pk):
    resource_pack = get_object_or_404(ResourcePack, pk=pk)
    response = FileResponse(resource_pack.file.open('rb'))
    response['content_disposition'] = 'attachment; filename="{}"'.format(resource_pack.file.name)
    resource_pack.downloads += 1
    if request.user.is_authenticated:
        resource_pack.downloads_by.add(request.user)
    resource_pack.save()
    return response


@api_view(['GET'])
def get_new_for_pagination(request, last_rp_num: int):
    style = request.query_params.get('style', '').strip()
    color = request.query_params.get('color', '').strip()
    resolution = request.query_params.get('resolution', '').strip()
    sort = request.query_params.get('sort', '').strip()
    author = request.query_params.get('author', '').strip()

    rps_all = ResourcePack.objects.filter(available=True)

    if style.lower() in ResourcePack.Style.values:
        rps_all = rps_all.filter(style__iexact=style)
    if color.lower() in ResourcePack.Color.values:
        rps_all = rps_all.filter(color__iexact=color)
    if resolution.lower() in ResourcePack.Resolution.values:
        rps_all = rps_all.filter(resolution__iexact=resolution)
    if ResourcePack.objects.filter(uploaded_by__username=author).exists():
        rps_all = rps_all.filter(uploaded_by__username=author)

    sort_mapping = {
        'likes': '-likes',
        'loads': '-downloads',
        'date': '-date_created'
    }

    if sort.lower() in sort_mapping:
        rps_all = rps_all.order_by(sort_mapping[sort.lower()])

    count = rps_all.count()

    if count > last_rp_num + settings.PAGINATION_RP_COUNT:
        rps = rps_all[last_rp_num:last_rp_num + settings.PAGINATION_RP_COUNT]
    elif count != last_rp_num:
        rps = rps_all[last_rp_num:]
    else:
        return Response({'end': True}, status=status.HTTP_200_OK)

    serializer = ResourcePackSerializer(rps, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def search(request):
    text = request.GET.get('text')
    if not text:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    rps = ResourcePack.objects.filter(name__icontains=text)
    serializer = ResourcePackSerializer(rps, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


def catalog(request):
    authors_ = User.objects.filter(rp__available=True).annotate(rp_count=Count('rp')).order_by('-rp_count')

    return render(request, 'APP_resource_pack/catalog.html', {
        'rp': ResourcePack.objects.first(),
        'authors': authors_
    })


def detail(request, slug=None):
    if not slug:
        return render_invalid(request, NOT_FOUND_404, 'rp:catalog')
    try:
        rp = ResourcePack.objects.get(slug=slug)
    except ResourcePack.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'rp:catalog')
    return render(request, 'APP_resource_pack/detail.html', {'rp': rp})


@login_required(redirect_field_name=None, login_url='signin')
@decorator_from_middleware(reCaptchaMiddleware)
@transaction.atomic
@api_view(['GET', 'POST'])
def add_new(request):
    if request.method != 'POST':
        return render(request, 'APP_resource_pack/add_new.html', {
            'resolutions': ResourcePack.Resolution.values, 'styles': ResourcePack.Style.values,
            'colors': ResourcePack.Color.values, 'mapRpOverviewFile': File.objects.get(name='mapRpOverviewFile')})

    # if not request.recaptcha_is_valid:
    #     return Response({'data': RECAPTCHA_INVALID}, status=status.HTTP_403_FORBIDDEN)

    name = str(request.POST.get('name')).strip('\n\t').strip()
    style = str(request.POST.get('style')).strip('\n\t').strip()
    color = str(request.POST.get('color')).strip('\n\t').strip()
    resolution = str(request.POST.get('resolution')).strip('\n\t').strip()
    user_ = request.user
    file: InMemoryUploadedFile = request.FILES.get('file')
    images: List[InMemoryUploadedFile] = request.FILES.getlist('images[]')
    image_preview: InMemoryUploadedFile = request.FILES.get('image_preview')

    if not all([name, style, color, resolution, file, image_preview, len(images) <= 5]):
        return Response({'data': NOT_ALL_FIELDS_FILLED_OR_INCORRECT}, status=status.HTTP_403_FORBIDDEN)

    if ResourcePack.objects.filter(name=name).exists():
        return Response({'data': OBJ_WITH_THIS_NAME_EXISTS}, status=status.HTTP_400_BAD_REQUEST)

    if style not in ResourcePack.Style.values or color not in ResourcePack.Color.values or resolution not in ResourcePack.Resolution.values:
        return Response({'data': SOMETHING_WRONG}, status=status.HTTP_400_BAD_REQUEST)

    if file.size > 100 * 1024 * 1024:
        return Response({'data': FILE_TOO_BIG}, status=status.HTTP_400_BAD_REQUEST)

    if image_preview.size > 5 * 1024 * 1024:
        return Response({'data': FILE_TOO_BIG}, status=status.HTTP_400_BAD_REQUEST)

    for image in images:
        if image.size > 5 * 1024 * 1024:
            return Response({'data': IMAGE_TOO_BIG}, status=status.HTTP_400_BAD_REQUEST)
    rp_ = ResourcePack.objects.create(
        name=name, slug=slugify(translit(name, 'ru', reversed=True)), uploaded_by=user_, file=file,
        style=style, color=color, resolution=resolution)

    image_preview_ = ResourcePackImage.objects.create(resource_pack=rp_, image=image_preview)
    rp_.image_preview = image_preview_

    for image in images:
        image_ = ResourcePackImage.objects.create(resource_pack=rp_, image=image)
        rp_.images.add(image_)

    rp_.save()

    return Response({'data': rp_.slug}, status=status.HTTP_200_OK)
