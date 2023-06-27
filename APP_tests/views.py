from django.shortcuts import render


def catalog(request):
    return render(request, 'APP_tests/catalog.html')


def test(request, slug=None):
    pass


def create_test(request):
    pass


def create_question(request, test_id: int):
    pass


def check_user_answer(request, question_id: int, user_answer: str):
    pass