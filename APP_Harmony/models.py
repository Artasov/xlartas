from django.db import models

from Core.models import User


class TrainerPreset(models.Model):
    class CadenceName(models.TextChoices):
        AuthenticCadence = 'AuthenticCadence'
        PlagalCadence = 'PlagalCadence'
        DeceptiveCadence = 'DeceptiveCadence'
        HalfCadence = 'HalfCadence'
        AmenCadence = 'AmenCadence'
        PhrygianHalfCadence = 'PhrygianHalfCadence'
        BackdoorCadence = 'BackdoorCadence'

    class Scale(models.TextChoices):
        C = 'C'
        Cm = 'Cm'
        CSharp = 'C#'
        CSharpM = 'C#m'
        D = 'D'
        Dm = 'Dm'
        DSharp = 'D#'
        DSharpM = 'D#m'
        E = 'E'
        Em = 'Em'
        F = 'F'
        Fm = 'Fm'
        FSharp = 'F#'
        FSharpM = 'F#m'
        G = 'G'
        Gm = 'Gm'
        GSharp = 'G#'
        GSharpM = 'G#m'
        A = 'A'
        Am = 'Am'
        ASharp = 'A#'
        ASharpM = 'A#m'
        B = 'B'
        Bm = 'Bm'
        random = 'random'
        randomMajor = 'randomMajor'
        randomMinor = 'randomMinor'

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trainer_presets', verbose_name='Author')
    name = models.CharField(max_length=100, verbose_name="Name")
    category = models.ForeignKey('TrainerPresetCategory', on_delete=models.CASCADE, verbose_name="Category")
    desc = models.TextField(max_length=400, blank=True, verbose_name="Description")
    scale_name = models.CharField(
        max_length=20,
        choices=Scale.choices,
        verbose_name="Scale Name")
    scale_octave = models.PositiveIntegerField(default=4, verbose_name="Scale Octave")
    degrees = models.JSONField(verbose_name="Degrees")
    chromatic = models.BooleanField(default=False, verbose_name="Chromatic")
    hidden_note_octave = models.IntegerField(default=4, verbose_name='Hidden Note Octave')
    count_questions = models.PositiveIntegerField(default=10, verbose_name='Count Questions')
    cadence_name = models.CharField(
        max_length=100,
        choices=CadenceName.choices,
        default=CadenceName.AuthenticCadence,
        verbose_name="Cadence Name")
    play_cadence_every_n_question = models.PositiveIntegerField(default=1, verbose_name='Cadence Every N')
    cadence_octave = models.PositiveIntegerField(default=4, verbose_name='Cadence Octave')
    available_replay = models.BooleanField(default=True, verbose_name='Available Replay Question')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TrainerPresetCategory(models.Model):
    name = models.CharField(max_length=100)
    desc = models.CharField(max_length=300, blank=True)

    def __str__(self):
        return self.name
