from rest_framework import status
from rest_framework.exceptions import APIException
from transliterate.utils import _


class UserExceptions:
    class UsernameAlreadyExists(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('A user with that username already exists')}
        default_code = 'username_already_exists'

    class UserEmailAlreadyExists(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('A user with that email already exists')}
        default_code = 'user_email_already_exists'

    class AlreadyThisUsername(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('You already have this username installed.')}
        default_code = 'already_this_username'

    class UserWithThisEmailNotFound(APIException):
        status_code = status.HTTP_404_NOT_FOUND
        default_detail = {'message': _('User with this email not found.')}
        default_code = 'user_with_this_email_not_found'

    class DiscordUsernameWasNotProvided(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _("'Failed to retrieve discord username.'")}
        default_code = 'discord_username_was_not_provided'

    class GoogleEmailWasNotProvided(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _("'Failed to retrieve google user's email.'")}
        default_code = 'google_email_was_not_provided'

    class DiscordEmailWasNotProvided(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _("'Failed to retrieve discord user's email.'")}
        default_code = 'discord_email_was_not_provided'

    class DiscordUserIdWasNotProvided(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Failed to obtain discord user id in social service.')}
        default_code = 'discord_user_id_was_not_provided'
