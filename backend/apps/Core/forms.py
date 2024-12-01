from django import forms

from apps.Core.error_messages import PASSWORDS_NOT_EQUAL, RECAPTCHA_INVALID
from apps.Core.models.user import User
from apps.Core.services.base import get_user_by_email_or_name, check_google_captcha_is_valid


class FormWithRecaptchaValidator(forms.Form):
    def clean(self):
        cleaned_data = super().clean()
        # if not check_google_captcha_is_valid(self.data.get('g-recaptcha-response')):
        #     raise forms.ValidationError(RECAPTCHA_INVALID)
        return cleaned_data


class ModelFormWithRecaptchaValidator(forms.ModelForm):
    def clean(self):
        cleaned_data = super().clean()
        if not check_google_captcha_is_valid(self.data.get('g-recaptcha-response')):
            raise forms.ValidationError(RECAPTCHA_INVALID)
        return cleaned_data


class UserCreationForm(ModelFormWithRecaptchaValidator):
    username = forms.CharField(
        label='Username',
        max_length=User._meta.get_field('username').max_length,
        widget=forms.TextInput(attrs={'placeholder': 'Username'}))
    email = forms.EmailField(
        label='Email',
        max_length=User._meta.get_field('email').max_length,
        widget=forms.EmailInput(attrs={'placeholder': 'Email'}))
    password1 = forms.CharField(
        label='Password',
        max_length=User._meta.get_field('password').max_length,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    password2 = forms.CharField(
        label='Password Confirm',
        max_length=User._meta.get_field('password').max_length,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password Confirm'}))

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        try:
            User.objects.get(email=email)
            raise forms.ValidationError(
                "Пользователь с таким почтовым адресом уже существует."
            )
        except User.DoesNotExist:
            pass
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password1')
        user.set_password(password)
        if commit:
            user.save()
        return user


class UserLoginForm(forms.Form):
    login_str = forms.CharField(
        label='Username / Email',
        required=True,
        max_length=User._meta.get_field('username').max_length,
        widget=forms.TextInput(attrs={'placeholder': 'Username / Email'}))
    password = forms.CharField(
        label='Password',
        required=True,
        max_length=User._meta.get_field('password').max_length,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))

    def clean(self):
        cleaned_data = super().clean()
        login_str = cleaned_data.get('login_str')
        user_, error = get_user_by_email_or_name(login_str)
        if user_ is None:
            raise forms.ValidationError(error)

        cleaned_data['username'] = user_.username

        return cleaned_data


class PasswordResetConfirmForm(forms.Form):
    password1 = forms.CharField(
        label='Password',
        max_length=User._meta.get_field('password').max_length,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    password2 = forms.CharField(
        label='Password Confirm',
        max_length=User._meta.get_field('password').max_length,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password Confirm'}))

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(PASSWORDS_NOT_EQUAL)
        return cleaned_data


class PasswordResetFormLoginField(forms.Form):
    login_str = forms.CharField(
        label='Username / Email',
        max_length=User._meta.get_field('email').max_length,
        widget=forms.TextInput(attrs={'placeholder': 'Username / Email'}))

    def clean(self):
        cleaned_data = super().clean()
        login_str = cleaned_data.get('login_str')
        user_, error = get_user_by_email_or_name(login_str)
        if user_ is None:
            raise forms.ValidationError(error)

        cleaned_data['user'] = user_

        return cleaned_data


class DonateFrom(FormWithRecaptchaValidator):
    amount = forms.IntegerField(required=True, min_value=50)