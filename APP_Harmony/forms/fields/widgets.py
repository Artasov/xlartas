from django import forms


class DegreesWidget(forms.TextInput):
    template_name = 'APP_Harmony/widgets/degrees_widget.html'
