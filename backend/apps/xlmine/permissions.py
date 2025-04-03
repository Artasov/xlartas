# xlmine/permissions.py
from rest_framework.permissions import BasePermission

from apps.core.models import Role


class IsMinecraftDev(BasePermission):
    def has_permission(self, request, view):
        return (
                request.user.is_authenticated and
                hasattr(request.user, 'roles') and
                request.user.roles.filter(name=Role.Variant.MINE_DEV).exists()
        )
