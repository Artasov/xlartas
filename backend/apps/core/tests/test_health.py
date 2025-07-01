# core/tests/test_health.py
from django.test import TestCase

from apps.core.models import User


class ChangeUserIdViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='staff', password='pass', is_staff=True
        )
        self.client.force_login(self.user)

    def test_change_user_id_returns_200(self):
        url = f'/change_user_id/{self.user.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
