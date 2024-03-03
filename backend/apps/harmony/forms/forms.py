from django import forms

from .fields.forms_fields import DegreesField
from ..models import TrainerPreset


class TrainerPresetForm(forms.ModelForm):
    degrees = DegreesField(
        label="Degrees",
        required=True,
        help_text="1-8 separated by spaces"
    )

    class Meta:
        model = TrainerPreset
        exclude = ['author']
