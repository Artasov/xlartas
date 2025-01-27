# core/tests/test_models.py
from django.test import TestCase
from apps.core.models.user import User


class UserModelTest(TestCase):
    def setUp(self):
        pass  # Здесь можно создать другие необходимые объекты для тестов

    def test_create_user(self):
        user = User.objects.create(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpassword'))

    def test_reject_waiting_bills(self):
        # TODO: Write test for reject_waiting_bills method
        pass


# class UnconfirmedUserModelTest(TestCase):
#     def test_unconfirmed_user_creation(self):
#         unconfirmed_user = UnconfirmedUser.objects.create(
#             username='testuser',
#             email='test@example.com',
#             password=make_password('testpassword'),
#             confirmation_code='abc123',
#             created_at=timezone.now()
#         )
#         self.assertEqual(unconfirmed_user.username, 'testuser')
#         self.assertEqual(unconfirmed_user.email, 'test@example.com')
#         self.assertEqual(unconfirmed_user.confirmation_code, 'abc123')
#         self.assertIsNotNone(unconfirmed_user.created_at)
#
#
# class UnconfirmedPasswordResetModelTest(TestCase):
#     def test_unconfirmed_password_reset_creation(self):
#         unconfirmed_reset = UnconfirmedPasswordReset.objects.create(
#             email='test@example.com',
#             confirmation_code='abc123',
#             created_at=timezone.now()
#         )
#         self.assertEqual(unconfirmed_reset.email, 'test@example.com')
#         self.assertEqual(unconfirmed_reset.confirmation_code, 'abc123')
#         self.assertIsNotNone(unconfirmed_reset.created_at)


# class FileModelTest(TestCase):
#     def test_file_creation(self):
#         file_content = b'Test file content'
#         file = SimpleUploadedFile('test_file.txt', file_content)
#         test_file = File.objects.create(
#             name='Test File',
#             file=file
#         )
#         self.assertEqual(test_file.name, 'Test File')
#         self.assertEqual(test_file.file.read(), file_content)
