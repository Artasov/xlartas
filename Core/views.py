import hashlib
import hmac
import json
import os
import time

from allauth.socialaccount.models import SocialAccount
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils.decorators import decorator_from_middleware

from APP_referral.models import RefLinking
from APP_shop.models import Product, License
from params_and_funcs import EMAIL_validator, reCAPTCHA_validation
from params_and_funcs import send_email_by_template
from .ErrMsg import RECAPTCHA_INVALID, NOT_FOUND_404
from .funcs import renderInvalid
from .middleware import reCaptchaMiddleware
from .models import *


def test(request):
    pass
    # return render(request, 'Core/email_templates/email_signup_confirmation.html', {'get_host': request.get_host(),
    #                                     'is_secure': request.is_secure(), 'confirmation_code': '123'})
    # send_email_by_template(subject='Completion of registration',
    #                        to_email='ivanhvalevskey@gmail.com',
    #                        template='Core/email_templates/email_signup_confirmation.html',
    #                        context={'get_host': request.get_host(),
    #                                 'is_secure': request.is_secure()})

@transaction.atomic
@decorator_from_middleware(reCaptchaMiddleware)
def signup(request):
    if request.user.is_authenticated:
        logout(request)

    if request.method == "POST":
        username = str(request.POST['username'])
        email = str(request.POST['email'])
        password = str(request.POST['password'])

        if not request.recaptcha_is_valid:
            return render(request, 'Core/registration/signup.html', context={
                'invalid': 'Invalid reCAPTCHA. Please try again.',
                'username': username, 'email': email, })

        if not EMAIL_validator(email):
            return render(request, 'Core/registration/signup.html', context={
                'invalid': 'The Email field must be filled in, must have the type ***@***.***',
                'username': username, 'email': email, })
        if len(password) < 6:
            return render(request, 'Core/registration/signup.html', context={
                'invalid': 'The password field must contain at least 6 characters.',
                'username': username, 'email': email, })
        if len(username) < 6:
            username = email[0:email.find('@')]
        if User.objects.filter(username=username).exists():
            return render(request, 'Core/registration/signup.html', context={
                'invalid': 'User with this name already exists.',
                'username': username, 'email': email, })
        if User.objects.filter(email=email).exists():
            return render(request, 'Core/registration/signup.html', context={
                'invalid': 'User with such an email already exists.',
                'username': username, 'email': email, })

        confirmation_code = random_str(40)
        UnconfirmedUser.objects.create(username=username,
                                       email=email,
                                       password=make_password(password),
                                       confirmation_code=confirmation_code, )

        send_email_by_template(subject='Completion of registration',
                               to_email=email,
                               template='Core/email_templates/email_signup_confirmation.html',
                               context={'get_host': request.get_host(),
                                        'is_secure': request.is_secure(),
                                        'confirmation_code': confirmation_code})
        return render(request, 'Core/check_email.html')
    return render(request, 'Core/registration/signup.html')


@transaction.atomic
def signup_confirmation(request, confirmation_code):
    if request.user.is_authenticated:
        logout(request)

    unconfirmed_user = UnconfirmedUser.objects.filter(confirmation_code=confirmation_code).first()
    if unconfirmed_user:
        user = User.objects.create(username=unconfirmed_user.username,
                                   email=unconfirmed_user.email,
                                   password=unconfirmed_user.password)
        unconfirmed_user.delete()

        return render(request, 'Core/registration/signin.html', context={
            'success': 'You have successfully registered.'
        })
    else:
        return renderInvalid(request, NOT_FOUND_404, 'signup')


def signin(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect('signin')

    if request.method == "POST":
        # CHECKING EMAIL OR USERNAME AUTH
        if '@' in request.POST['username']:
            username = User.objects.get(email=request.POST['username']).username
        else:
            username = request.POST['username']
        user = authenticate(request, username=username, password=request.POST['password'])
        if user is not None:
            login(request, user)
            return redirect('main')
        else:
            return render(request, 'Core/registration/signin.html', context={
                'invalid': 'Invalid username/email or password',
                'username': username})

    return render(request, 'Core/registration/signin.html')


def telegram_verify_hash(auth_data):
    check_hash = auth_data['hash']

    del auth_data['hash']
    data_check_arr = []
    for key, value in auth_data.items():
        data_check_arr.append(f'{key}={value}')
    data_check_arr.sort()
    data_check_string = '\n'.join(data_check_arr)
    secret_key = hashlib.sha256(os.getenv('TELEGRAM_TOKEN').encode()).digest()
    hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if hash != check_hash:
        return False
    if time.time() - int(auth_data['auth_date']) > 86400:
        return False
    return True


@transaction.atomic
def telegram_auth(request):
    if request.method == 'GET':
        data = request.GET.dict()

        if not telegram_verify_hash(data):
            return renderInvalid(request, 'Invalid hash', 'signup')

        del data['auth_date']

        telegram_id = data['id']
        username = data['username']
        first_name = data['first_name']

        if User.objects.filter(username=username).exists():
            username = 'x' + username

        if SocialAccount.objects.filter(uid=telegram_id, provider='telegram').exists():
            user_ = SocialAccount.objects.get(uid=telegram_id, provider='telegram').user
            login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
        else:
            user_ = User.objects.create(username=username, first_name=first_name)
            SocialAccount.objects.create(user=user_, uid=telegram_id,
                                         provider='telegram',
                                         extra_data=json.dumps(data))
            login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
        return redirect('main')


@transaction.atomic
def vk_auth(request):
    uid = request.GET.get('uid')
    first_name = request.GET.get('first_name')
    last_name = request.GET.get('last_name')
    hash = request.GET.get('hash')
    hash_valid = hashlib.md5(str(os.getenv('VK_CLIENT_ID') + uid + os.getenv('VK_SECRET')).encode()).hexdigest()

    if not uid or hash != hash_valid:
        return render(request, 'Core/registration/signup.html', context={
            'invalid': 'Vk auth invalid, pls contact us'})
    user_, created = User.objects.get_or_create(id=uid,
                                                first_name=first_name,
                                                last_name=last_name,
                                                username=first_name)
    login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
    return redirect('main')


def password_reset(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect('password_reset')

    if request.method == "POST":
        email_ = str(request.POST['email'])
        if not reCAPTCHA_validation(request)['success']:
            return render(request, 'Core/registration/password_reset_stage_1.html', context={
                'invalid': RECAPTCHA_INVALID, })
        if not EMAIL_validator(email_):
            return render(request, 'Core/registration/password_reset_stage_1.html', context={
                'invalid': 'The Email field must be filled in, must have the type ***@***.***', })
        if not User.objects.filter(email=email_).exists():
            return render(request, 'Core/registration/password_reset_stage_1.html', context={
                'invalid': 'User with this email does not exists', })

        confirmation_code = random_str(40)
        UnconfirmedPasswordReset.objects.create(email=email_,
                                                confirmation_code=confirmation_code)

        send_email_by_template(subject='Password reset',
                               to_email=email_,
                               template='Core/email_templates/email_password_reset_confirmation.html',
                               context={'link': request.get_host() + reverse('password_reset_confirmation',
                                                                             args=[confirmation_code])})
        return render(request, 'Core/check_email.html')

    return render(request, 'Core/registration/password_reset_stage_1.html')


@transaction.atomic
def password_reset_confirmation(request, confirmation_code):
    if request.user.is_authenticated:
        return redirect('logout')

    if request.method == "POST":
        if UnconfirmedPasswordReset.objects.filter(confirmation_code=confirmation_code).exists():
            unconfirmedpasswordreset_ = UnconfirmedPasswordReset.objects.get(confirmation_code=confirmation_code)
            user_ = User.objects.get(email=unconfirmedpasswordreset_.email)
            user_.password = make_password(request.POST['new_password'])
            user_.save()
            unconfirmedpasswordreset_.delete()
            return render(request, 'Core/registration/signin.html', {'success': 'Password changed'})
        else:
            return renderInvalid(request, NOT_FOUND_404, 'signup')

    return render(request, 'Core/registration/password_reset_stage_2.html', {
        'confirmation_code': confirmation_code
    })


@login_required(redirect_field_name=None, login_url='signin')
def profile(request):
    user_ = User.objects.get(username=request.user.username)
    user_licenses = License.objects.filter(user=user_)
    least_days = {}
    for license_ in user_licenses:
        remained = int((license_.date_expiration - datetime.utcnow()).total_seconds() / 3600)
        if remained > 9600:
            remained = 'FOREVER'
        elif remained < 1:
            remained = 'None'
        least_days[Product.objects.get(id=license_.product_id).name] = remained
    if RefLinking.objects.filter(referral__username=user_.username).exists():
        return render(request, 'Core/profile.html', {
            'least_days': least_days,
            'user_': user_,
            'inviter_': RefLinking.objects.get(referral__username=user_.username).inviter,
            'domain': request.build_absolute_uri('/')[0:-1]})
    return render(request, 'Core/profile.html', {
        'least_days': least_days,
        'user_': user_,
        'domain': request.build_absolute_uri('/')[0:-1]})


def donate(request):
    return render(request, 'Core/donate.html', {})



