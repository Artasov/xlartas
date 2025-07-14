# converter/tests/test_services.py
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.converter.models import Format, Conversion
from apps.converter.services.converter import ConversionService, AudioConverter, ImageConverter


@pytest.mark.django_db
async def test_detect_audio_converter():
    src = await Format.objects.acreate(name='wav')
    dst = await Format.objects.acreate(name='mp3')
    conv = Conversion(
        ip='0.0.0.0',
        input_file=SimpleUploadedFile('f.wav', b'data'),
        source_format=src,
        target_format=dst,
    )
    service = ConversionService(conv)
    assert service.detect_converter() is AudioConverter


@pytest.mark.django_db
async def test_detect_image_converter():
    src = await Format.objects.acreate(name='png')
    dst = await Format.objects.acreate(name='jpg')
    conv = Conversion(
        ip='0.0.0.0',
        input_file=SimpleUploadedFile('f.png', b'data'),
        source_format=src,
        target_format=dst,
    )
    service = ConversionService(conv)
    assert service.detect_converter() is ImageConverter
