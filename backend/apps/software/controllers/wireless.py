from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.software.models.wireless import WirelessMacro
from apps.software.serializers.wireless import WirelessMacroSerializer


class WirelessMacroViewSet(ModelViewSet):
    """
    /api/wireless-macros/ — CRUD для сохранённых имён макросов.
    """
    serializer_class = WirelessMacroSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return WirelessMacro.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
