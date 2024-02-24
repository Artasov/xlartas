from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from transliterate import translit

from apps.Core.error_messages import NOT_FOUND_404, NOT_ALL_FIELDS_FILLED, RECAPTCHA_INVALID
from apps.Core.services.services import render_invalid, check_recaptcha_is_valid
from .ErrMsg import UPLOAD_TOO_BIG
from .models import Upload, UploadedFile


@login_required(redirect_field_name=None, login_url='signin')
def list_user_upload(request):
    uploads_ = Upload.objects.filter(user=request.user)
    return render(request, 'APP_filehost/list.html', {'uploads_': uploads_})


@login_required(redirect_field_name=None, login_url='signin')
def delete(request, key=None):
    if key is None:
        return render_invalid(request, NOT_FOUND_404, 'host:create')

    try:
        upload_ = Upload.objects.get(key=key)
    except Upload.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'host:create')

    if upload_.user.username == request.user.username or request.user.is_staff:
        upload_.delete()

    return redirect('read_upload', key)


def read(request, key=None):
    if key is None:
        return render_invalid(request, NOT_FOUND_404, 'host:create')

    try:
        upload_ = Upload.objects.get(key=key)
    except Upload.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'host:create')

    author = False
    if request.user.is_authenticated:
        if upload_.user.username == request.user.username:
            author = True

    uploadedfile_ = UploadedFile.objects.filter(upload=upload_)

    # HOURS FOR DELETE
    delete_in = int((upload_.date_delete - upload_.date_created).total_seconds() // 3600)
    if delete_in < 1:
        return render_invalid(request, NOT_FOUND_404, 'host:create')

    return render(request, 'APP_filehost/read.html', {
        'upload': upload_,
        'files': uploadedfile_,
        'delete_in': delete_in,
        'author': author
    })


def create(request):
    if request.method != 'POST':
        return render(request, 'APP_filehost/create.html')

    if request.user.is_authenticated:
        MAX_UPLOAD_SIZE = settings.MAX_UPLOAD_SIZE_AUTHED_MB * 1024 * 1024
    else:
        MAX_UPLOAD_SIZE = settings.MAX_UPLOAD_SIZE_ANON_MB * 1024 * 1024

    if not check_recaptcha_is_valid(request.POST.get('g-recaptcha-response')):
        return render(request, 'APP_filehost/create.html', {'invalid': RECAPTCHA_INVALID})

    files = request.FILES.getlist('files[]')
    name = request.POST.get('name', None)

    if not files or not name:
        return render(request, 'APP_filehost/create.html', {'invalid': NOT_ALL_FIELDS_FILLED})

    # CHECK SIZE
    total_size = sum(file.size for file in files)
    if total_size > MAX_UPLOAD_SIZE:
        return render_invalid(request, UPLOAD_TOO_BIG, 'host:create')

    # UPLOADING
    upload_ = Upload.objects.create(name=name, user=request.user if request.user.is_authenticated else None,
                                    size=total_size)
    for file in files:
        file_name = translit(str(file.name), language_code='ru', reversed=True).replace(' ', '_')
        UploadedFile.objects.create(upload=upload_, file=file, size=file.size, name=file_name)

    return redirect('host:read', upload_.key)
