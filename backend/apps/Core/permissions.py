from rest_framework import permissions


class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff or request.user.is_manager  # Предполагается, что у вас есть is_manager
