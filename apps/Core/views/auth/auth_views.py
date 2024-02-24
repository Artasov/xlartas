from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect, get_object_or_404
from apps.Core.error_messages import PASSWORD_WRONG, CONFIRMATION_CODE_EXPIRE, CONFIRMATION_CODE_SENT_TOO_OFTEN, \
    EMAIL_SENT, SUCCESSFULLY_REGISTERED, PASSWORD_RESET_SUCCESS
from apps.Core.forms import UserCreationForm, UserLoginForm, PasswordResetFormLoginField, PasswordResetConfirmForm
from apps.Core.models import *
from apps.Core.services.code_confirmation import is_code_sending_too_often, get_latest_confirmation_code, \
    create_confirmation_code_for_user, send_password_reset_email, send_signup_confirmation_email
from apps.Core.services.services import forbidden_with_login, base_view, render_invalid


@base_view
@forbidden_with_login
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
    code_ = get_object_or_404(ConfirmationCode, code=code, type=ConfirmationCode.CodeType.signUp)
    form = UserLoginForm()
    form.cleaned_data = []  # Else we won't be able to add errors.
    context = {}

    if code_.is_expired():
        code_latest_ = get_latest_confirmation_code(code_.user.id, code_.type)
        form.add_error(None, CONFIRMATION_CODE_EXPIRE)
        if is_code_sending_too_often(code_latest_):
            form.add_error(None, CONFIRMATION_CODE_SENT_TOO_OFTEN)
        else:
            new_code_ = create_confirmation_code_for_user(code_.user.id, code_.type)
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
@forbidden_with_login
def password_reset(request):
    form = PasswordResetFormLoginField(request.POST or None)
    context = {}

    if form.is_valid():
        user_: User = form.cleaned_data['user']
        code_: ConfirmationCode = get_latest_confirmation_code(
            user_id=user_.id,
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
    code_ = get_object_or_404(ConfirmationCode, code=code, type=ConfirmationCode.CodeType.resetPassword)

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
