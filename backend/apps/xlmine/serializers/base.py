# xlmine/serializers/base.py
from adjango.aserializers import AModelSerializer

from apps.xlmine.models import Launcher, Release, Privilege


class LauncherSerializer(AModelSerializer):
    class Meta:
        model = Launcher
        fields = '__all__'
        extra_kwargs = {
            'version': {'read_only': True},
            'sha256_hash': {'read_only': True}
        }


class ReleaseSerializer(AModelSerializer):
    class Meta:
        model = Release
        fields = '__all__'
        extra_kwargs = {
            'version': {'read_only': True},
            'sha256_hash': {'read_only': True}
        }


class PrivilegeSerializer(AModelSerializer):
    class Meta:
        model = Privilege
        fields = '__all__'
