from apps.core.models.user import User


async def is_user_exist(**kwargs) -> bool:
    return await User.objects.filter(**kwargs).aexists()


