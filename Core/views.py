import hashlib
import hmac
import json
import os
import time

from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from django.utils.decorators import decorator_from_middleware

from APP_referral.models import RefLinking
from APP_shop.models import Product, License
from .error_messages import NOT_FOUND_404, PASSWORD_WRONG, CONFIRMATION_CODE_EXPIRE, CONFIRMATION_CODE_SENT_TOO_OFTEN, \
    EMAIL_SENT, SUCCESSFULLY_REGISTERED, PASSWORD_RESET_SUCCESS
from .forms import UserCreationForm, UserLoginForm, PasswordResetFormLoginField, PasswordResetConfirmForm
from .middleware import reCaptchaMiddleware
from .models import *
from .services.code_confirmation import is_code_sending_too_often, get_latest_confirmation_code, \
    create_confirmation_code_for_user, send_password_reset_email, send_signup_confirmation_email
from .services.services import forbidden_with_login, base_view, render_invalid, telegram_verify_hash


@base_view
@forbidden_with_login
@decorator_from_middleware(reCaptchaMiddleware)
def signup(request):
    form = UserCreationForm(request.POST or None)
    if form.is_valid():
        user_: User = form.save()
        code_ = create_confirmation_code_for_user(user_.id, ConfirmationCode.CodeType.signUp)
        send_signup_confirmation_email(request, user_.email, code_.code)
        return render(request, 'Core/check_email.html')

    return render(request, 'Core/registration/signup.html', {'form': form})


@base_view
@forbidden_with_login
def signup_confirmation(request, code):
    try:
        code_ = ConfirmationCode.objects.get(code=code, type=ConfirmationCode.CodeType.signUp)
    except ConfirmationCode.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'signup')

    form = UserLoginForm()
    form.cleaned_data = []  # Else we won't be able to add errors.
    context = {}

    if code_.is_expired():
        code_latest_ = get_latest_confirmation_code(code_.user.id, code_.type)
        form.add_error(None, CONFIRMATION_CODE_EXPIRE)
        if is_code_sending_too_often(code_latest_):
            form.add_error(None, CONFIRMATION_CODE_SENT_TOO_OFTEN)
        else:
            new_code_ = create_confirmation_code_for_user(code_.user_id, code_.type)
            send_signup_confirmation_email(request, new_code_.user.email, new_code_.code)
            context['success'] = EMAIL_SENT.format(f'{new_code_.user.email[:4]}******')
    else:
        context['success'] = SUCCESSFULLY_REGISTERED
        code_.user.is_confirmed = True
        code_.user.save()
        code_.delete()

    context['form'] = form
    return render(request, 'Core/registration/signin.html', context)


@base_view
@forbidden_with_login
def signin(request):
    form = UserLoginForm(request.POST or None)
    context = {}
    if form.is_valid():
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password')
        user_: User = authenticate(request, username=username, password=password)
        if user_ is not None:
            if user_.is_confirmed:
                login(request, user_)
                return redirect('profile')
            else:
                code_ = get_latest_confirmation_code(user_.id, ConfirmationCode.CodeType.signUp)
                if is_code_sending_too_often(code_):
                    form.add_error(None, CONFIRMATION_CODE_SENT_TOO_OFTEN)
                else:
                    new_code_ = create_confirmation_code_for_user(user_.id, ConfirmationCode.CodeType.signUp)
                    send_signup_confirmation_email(request, user_.email, new_code_.code)
                    context['success'] = EMAIL_SENT.format(f'{user_.email[:4]}******')
        else:
            form.add_error(None, PASSWORD_WRONG)

    context['form'] = form
    return render(request, 'Core/registration/signin.html', context)


@base_view
def telegram_auth(request):
    if request.method == 'GET':
        data = request.GET.dict()

        if not telegram_verify_hash(data):
            return render_invalid(request, 'Invalid hash', 'signup')

        del data['auth_date']

        telegram_id = data['id']
        username = data['username']
        first_name = data['first_name']

        try:
            User.objects.get(username=username)
            username = username + get_random_string(10)
        except User.DoesNotExist:
            pass

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


@base_view
def vk_auth(request):
    uid = request.GET.get('uid')
    first_name = request.GET.get('first_name')
    last_name = request.GET.get('last_name')
    hash = request.GET.get('hash')
    hash_valid = hashlib.md5(str(os.getenv('VK_CLIENT_ID') + uid + os.getenv('VK_SECRET')).encode()).hexdigest()

    if not uid or hash != hash_valid:
        return render(request, 'Core/registration/signup.html', context={
            'invalid': 'Vk auth invalid, pls contact us'})
    try:
        user_, created = User.objects.get_or_create(id=uid,
                                                    first_name=first_name,
                                                    last_name=last_name,
                                                    username=first_name)
    except IntegrityError:
        user_ = User.objects.create(id=uid,
                                    first_name=first_name,
                                    last_name=last_name,
                                    username=first_name + get_random_string(10))

    login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
    return redirect('main')


@base_view
@forbidden_with_login
def password_reset(request):
    form = PasswordResetFormLoginField(request.POST or None)
    context = {}

    if form.is_valid():
        user_: User = form.cleaned_data['user']
        code_: ConfirmationCode = get_latest_confirmation_code(user_id=user_.id,
                                                               code_type=ConfirmationCode.CodeType.resetPassword)

        if code_ is not None:
            if is_code_sending_too_often(code_):
                form.add_error(None, CONFIRMATION_CODE_SENT_TOO_OFTEN)
            if code_.is_expired():
                form.add_error(None, CONFIRMATION_CODE_EXPIRE)

        if not (code_ is not None and is_code_sending_too_often(code_)):
            new_code_ = create_confirmation_code_for_user(user_.id, ConfirmationCode.CodeType.resetPassword)
            send_password_reset_email(request, user_.email, new_code_.code)
            context['success'] = EMAIL_SENT.format(f'{user_.email[:4]}******')

    context['form'] = form
    return render(request, 'Core/registration/password_reset_stage_1.html', context)


@base_view
@forbidden_with_login
def password_reset_confirmation(request, code):
    try:
        code_ = ConfirmationCode.objects.get(code=code, type=ConfirmationCode.CodeType.resetPassword)
    except ConfirmationCode.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'password_reset')

    if code_.is_expired():
        return render_invalid(request, CONFIRMATION_CODE_EXPIRE, 'password_reset')

    if request.method == 'POST':
        form = PasswordResetConfirmForm(request.POST)
        if form.is_valid():
            user_ = code_.user
            user_.set_password(form.cleaned_data['password1'])
            user_.save()
            code_.delete()
            return render(request, 'Core/registration/signin.html', {
                'success': PASSWORD_RESET_SUCCESS,
                'form': UserLoginForm()
            })
    return render(request, 'Core/registration/password_reset_stage_2.html', {
        'form': PasswordResetConfirmForm(),
        'code': code
    })


@base_view
@login_required(redirect_field_name=None, login_url='signin')
def profile(request):
    user_ = User.objects.get(username=request.user.username)
    user_licenses = License.objects.filter(user=user_)
    least_days = {}
    for license_ in user_licenses:
        remained = int((license_.date_expiration - timezone.now()).total_seconds() / 3600)
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


@base_view
def donate(request):
    return render(request, 'Core/donate.html', {})
