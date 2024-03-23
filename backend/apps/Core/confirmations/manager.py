from apps.confirmation.models.base import ActionTypes
from apps.confirmation.services.base import ConfirmationCodeManager


class CoreConfirmation(ConfirmationCodeManager):

    def get_func_for_action(self, action: str) -> callable:
        associations = {
            ActionTypes.SIGNUP: self.confirm_email,
            ActionTypes.RESET_PASSWORD: self.confirm_reset_password
        }
        print(associations)
        return associations.get(action, None)

    async def execute(self, **kwargs):
        print("Exec")
        await self.is_executable_or_raise()
        print(self.code.action)
        func = self.get_func_for_action(self.code.action)
        print(func)
        await func(self=self, **kwargs)
        print(func)
        self.code.is_used = True
        await self.code.asave()

    @staticmethod
    async def confirm_email(self):
        """
        Set user is_confirmed.
        :param self: CoreConfirmation object.
        """
        self.user.is_confirmed = True
        await self.user.asave()

    @staticmethod
    async def confirm_reset_password(self, **kwargs):
        """
        Reset Password.
        :param self: CoreConfirmation object.
        :param new_password: New user password.
        """
        print('--------------------')
        print(kwargs)
        self.user.set_password(kwargs.get('new_password'))
        await self.user.asave()
