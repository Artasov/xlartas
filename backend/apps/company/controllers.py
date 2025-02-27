# company/controllers.py
import logging

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import CompanyDocument, Company
from .serializers import CompanyDocumentSerializer, CompanySerializer

log = logging.getLogger('global')


@acontroller('Get Company Details with Public Documents')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_company_detail(request, name):
    return Response(await CompanySerializer(
        await Company.objects.agetorn(
            Company.NotFound, name=name
        ), context={'request': request}
    ).adata, status=200)


@acontroller('Get all public company documents by name')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_company_public_documents(request, name):
    return Response(await CompanyDocumentSerializer(
        await CompanyDocument.objects.filter(
            company=await Company.objects.agetorn(Company.NotFound, name=name),
            is_public=True
        ).aall(), many=True, context={'request': request}
    ).adata, status=200)


@acontroller('Get Company Document Details')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_company_document_detail(request, id):
    return Response(await CompanyDocumentSerializer(
        await CompanyDocument.objects.agetorn(
            CompanyDocument.NotFound, id=id, is_public=True
        ), context={'request': request}
    ).adata, status=200)
