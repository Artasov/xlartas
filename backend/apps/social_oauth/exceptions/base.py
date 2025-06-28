# social_oauth/exceptions/base.py

from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_400_BAD_REQUEST


class SocialOAuthException:
    class AccountAlreadyLinkedAnotherUser(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('This account is already linked to another user.')}
        default_code = 'account_already_linked_another_user'

    class GoogleIDNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Google ID not provided.')}
        default_code = 'google_id_not_provided'

    class VKIDNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('VK ID not provided.')}
        default_code = 'vk_id_not_provided'

    class YandexIDNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Yandex ID not provided.')}
        default_code = 'yandex_id_not_provided'

    class DiscordIDNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Discord ID not provided.')}
        default_code = 'discord_id_not_provided'

    class GoogleEmailWasNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The email was not provided by Google.')}
        default_code = 'google_email_not_provided'

    class VkEmailWasNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Email was not provided to VK.')}
        default_code = 'vk_email_not_provided'

    class YandexEmailWasNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The email was not provided by Yandex.')}
        default_code = 'yandex_email_not_provided'

    class DiscordEmailWasNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The email was not provided to Discord.')}
        default_code = 'discord_email_not_provided'

    class DiscordUsernameWasNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Failed to retrieve discord username.')}
        default_code = 'discord_username_was_not_provided'

    class DiscordUserIdWasNotProvided(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Failed to obtain discord user id in social service.')}
        default_code = 'discord_user_id_was_not_provided'
