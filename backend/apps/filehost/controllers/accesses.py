from adjango.adecorators import acontroller
from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.exceptions.user import UserExceptions
from apps.core.models.user import User
from apps.filehost.models import Access
from apps.filehost.serializers import AccessSerializer


@acontroller('Grant Access')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def grant_access(request):
    data = request.data
    folder_id = data.get('folder_id')
    file_id = data.get('file_id')
    email = data.get('email')
    is_public = data.get('is_public', False)

    if not folder_id and not file_id:
        return Response({'error': 'Folder ID or File ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    if email:
        try:
            user = await User.objects.aget(email=email)
        except User.DoesNotExist:
            raise UserExceptions.UserWithThisEmailNotFound()

    access = await Access.objects.acreate(
        folder_id=folder_id,
        file_id=file_id,
        user=user,
        email=email,
        is_public=is_public
    )

    return Response(
        await sync_to_async(lambda: AccessSerializer(access).data)(),
        status=status.HTTP_201_CREATED
    )


@acontroller('Delete Access')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def revoke_access(request):
    access_id = request.data.get('access_id')
    try:
        access = await Access.objects.aget(id=access_id)
    except Access.DoesNotExist:
        return Response({'error': 'Access not found'}, status=status.HTTP_404_NOT_FOUND)
    await access.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@acontroller('List accesses')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def list_accesses(request):
    folder_id = request.query_params.get('folder_id')
    file_id = request.query_params.get('file_id')

    if folder_id:
        accesses = await Access.objects.afilter(folder_id=folder_id)
    elif file_id:
        accesses = await Access.objects.afilter(file_id=file_id)
    else:
        return Response({'error': 'Folder ID or File ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        await AccessSerializer(accesses, many=True).adata,
        status=status.HTTP_200_OK
    )


@acontroller('Set Public FileHost Access')
@api_view(('PATCH',))
@permission_classes((IsAuthenticated,))
async def set_public(request):
    access_id = request.data.get('access_id')
    try:
        access = Access.objects.get(id=access_id)
    except Access.DoesNotExist:
        return Response({'error': 'Access not found'}, status=status.HTTP_404_NOT_FOUND)

    access.is_public = request.data.get('is_public', True)
    access.save()

    return Response(
        await sync_to_async(lambda: AccessSerializer(access).data)(),
        status=status.HTTP_200_OK
    )
