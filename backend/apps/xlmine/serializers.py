from adjango.aserializers import AModelSerializer

from apps.xlmine.models import Launcher, Release


class LauncherSerializer(AModelSerializer):
    class Meta:
        model = Launcher


class ReleaseSerializer(AModelSerializer):
    class Meta:
        model = Release
