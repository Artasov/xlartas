from django import forms


class DegreesWidget(forms.TextInput):
    template_name = 'harmony/widgets/degrees_widget.html'
