# from django.db import models
#
# from Core.models import User
#
#
# class Test(models.Model):
#     name = models.CharField(max_length=250)
#     desc = models.TextField(blank=True)
#
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='tests')
#     date_created = models.DateTimeField(auto_now_add=True)
#     date_updated = models.DateTimeField(auto_now=True)
#
#
# class Question(models.Model):
#     test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
#     question_text = models.CharField(max_length=1000)
#
#
#
#     date_created = models.DateTimeField(auto_now_add=True)
#     date_updated = models.DateTimeField(auto_now=True)
#
#
# class Answer(models.Model):
#     question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
#     answer_text = models.CharField(max_length=1000)
#     is_correct = models.BooleanField(default=False)
#     date_created = models.DateTimeField(auto_now_add=True)
#     date_updated = models.DateTimeField(auto_now=True)
#
#
# class TestResult(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_results')
#     test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_results')
#     score = models.IntegerField()
#     date_created = models.DateTimeField(auto_now_add=True)
