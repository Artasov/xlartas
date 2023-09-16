from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from APP_Harmony.services.Harmony.chords_progressions import ChordsProgressionsGenerator
from Core.services.services import base_view


@base_view
def trainer(request):
    return render(request, 'APP_Harmony/trainer.html')


@base_view
def chords(request):
    return render(request, 'APP_Harmony/chords.html')


@api_view()
def get_scale_chords_combinations(request,
                                  tonic: str,
                                  mode: str,
                                  quality: str,
                                  dim: int,
                                  progressions_len: int,
                                  max_repeats: int,
                                  out_sharp_or_flat: str):
    return Response(
        ChordsProgressionsGenerator().get_scale_chords_combinations(
            tonic=tonic,
            mode=mode,
            progressions_len=progressions_len,
            max_repeats=max_repeats,
            quality=quality,
            out_sharp_or_flat=out_sharp_or_flat,
            dim=bool(dim),
        )
    )


@api_view()
def get_chords_combinations_by_template(request,
                                        template: str,
                                        mode: str,
                                        quality: str,
                                        dim: int,
                                        out_sharp_or_flat: str):
    print(template)
    print(mode)
    print(quality)
    print(dim)
    print(out_sharp_or_flat)
    return Response(
        ChordsProgressionsGenerator().get_chords_combinations_by_template(
            template=tuple(template.replace('|', '/').split('_')),
            mode=mode, quality=quality, dim=dim,
            out_sharp_or_flat=out_sharp_or_flat
        )
    )
